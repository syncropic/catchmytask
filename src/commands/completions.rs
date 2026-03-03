use crate::cli::{Cli, CompletionsArgs};
use crate::error::Result;

pub fn execute(args: &CompletionsArgs) -> Result<()> {
    use clap::CommandFactory;
    use clap_complete::generate;

    let mut cmd = Cli::command();
    generate(args.shell, &mut cmd, "cmt", &mut std::io::stdout());

    Ok(())
}
