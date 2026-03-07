use clap::Parser;
use std::process;

mod cli;
mod commands;
mod mcp;
mod webhooks;

use cli::{Cli, Commands};
use cmt_core::error::WorkError;

fn main() {
    let cli = Cli::parse();

    // NO_COLOR handling: any value (including empty) disables color
    let no_color = cli.no_color
        || std::env::var("NO_COLOR").is_ok()
        || !is_terminal::is_terminal(std::io::stdout());

    cmt_core::format::set_color_enabled(!no_color);

    let result = run(&cli);

    match result {
        Ok(()) => process::exit(cmt_core::error::EXIT_SUCCESS),
        Err(e) => {
            let code = e.exit_code();
            if cli.json {
                let err = serde_json::json!({
                    "error": e.to_string(),
                    "code": code,
                });
                println!("{}", serde_json::to_string(&err).unwrap_or_default());
            } else {
                eprintln!("error: {}", e);
            }
            process::exit(code);
        }
    }
}

fn resolve_actor(cli: &Cli) -> Option<String> {
    cli.actor.clone()
        .or_else(|| std::env::var("CMT_ACTOR").ok())
        .or_else(|| std::env::var("USER").ok())
}

fn run(cli: &Cli) -> cmt_core::error::Result<()> {
    let actor = resolve_actor(cli);
    match &cli.command {
        Commands::Init(args) => {
            commands::init::execute(args, cli.json, cli.quiet)
        }
        Commands::Add(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::add::execute(args, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::List(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::list::execute(args, &work_dir, cli.json, cli.quiet)
        }
        Commands::Show(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::show::execute(args, &work_dir, cli.json)
        }
        Commands::Edit(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::edit::execute(args, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::Done(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::done::execute(args, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::Status(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::status::execute(args, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::Archive(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::archive::execute(args, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::Search(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::search::execute(args, &work_dir, cli.json)
        }
        Commands::Reindex(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::reindex::execute(args, &work_dir, cli.json, cli.quiet)
        }
        Commands::Check(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::check::execute(args, &work_dir, cli.json)
        }
        Commands::Delete(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::delete::execute(args, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::Config(cmd) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::config_cmd::execute(cmd, &work_dir, cli.json)
        }
        Commands::Log(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::log_cmd::execute(args, &work_dir, cli.json)
        }
        Commands::Completions(args) => {
            commands::completions::execute(args)
        }
        Commands::HelpAgent(args) => {
            let work_dir = resolve_work_dir(cli).ok();
            commands::help_agent::execute(args, work_dir.as_deref(), cli.json)
        }
        Commands::Setup(args) => {
            commands::setup::execute(args, cli.json, cli.quiet)
        }
        Commands::Serve(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::serve::execute(args, &work_dir)
        }
        Commands::Projects(args) => {
            let work_dir = resolve_work_dir(cli).ok();
            commands::projects::execute(args, work_dir.as_deref(), cli.json, cli.quiet)
        }
        Commands::Doctor(args) => {
            let work_dir = resolve_work_dir(cli).ok();
            commands::doctor::execute(args, work_dir.as_deref(), cli.json, cli.quiet)
        }
        Commands::Slugify(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::slugify::execute(args, &work_dir, cli.json, cli.quiet)
        }
        Commands::Comment(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::comment::execute(args, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::View(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::view::execute(args, &work_dir, cli.json, cli.quiet)
        }
        Commands::Bulk(args) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::bulk::execute(&args.command, &work_dir, cli.json, cli.quiet, actor.as_deref())
        }
        Commands::Webhook(cmd) => {
            let work_dir = resolve_work_dir(cli)?;
            commands::webhook::execute(cmd, &work_dir, cli.json, cli.quiet)
        }
        Commands::Mcp(_args) => {
            let work_dir = resolve_work_dir(cli)?;
            mcp::server::run_stdio(&work_dir)
        }
    }
}

fn resolve_work_dir(cli: &Cli) -> cmt_core::error::Result<std::path::PathBuf> {
    if let Some(ref dir) = cli.dir {
        if dir.exists() {
            return Ok(dir.clone());
        }
        return Err(WorkError::General(format!(
            "Specified directory '{}' does not exist",
            dir.display()
        )));
    }

    let cwd = std::env::current_dir()?;
    cmt_core::config::discover_work_dir(&cwd).ok_or(WorkError::WorkDirNotFound)
}
