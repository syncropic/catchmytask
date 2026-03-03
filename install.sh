#!/bin/sh
# Install script for catchmytask (cmt)
# Usage: curl -fsSL https://raw.githubusercontent.com/dpwanjala/catchmytask/master/install.sh | sh
#
# Options (via environment variables):
#   VERSION          - version to install (default: latest)
#   CMT_INSTALL_DIR - install directory (default: ~/.local/bin)
set -eu

REPO="dpwanjala/catchmytask"
BINARY="cmt"
VERSION="${VERSION:-latest}"
INSTALL_DIR="${CMT_INSTALL_DIR:-}"
BASE_URL="https://github.com/${REPO}/releases"

main() {
    detect_platform
    resolve_version
    determine_install_dir "$@"
    download_and_install
    verify_installation
    print_path_hint
    print_setup_hint
}

detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Linux)  OS="linux" ;;
        Darwin) OS="darwin" ;;
        *)
            printf "Error: unsupported OS: %s\n" "$OS" >&2
            printf "Install from source: cargo install --git https://github.com/%s.git\n" "$REPO" >&2
            exit 1
            ;;
    esac

    case "$ARCH" in
        x86_64|amd64)   ARCH="x86_64" ;;
        aarch64|arm64)   ARCH="aarch64" ;;
        *)
            printf "Error: unsupported architecture: %s\n" "$ARCH" >&2
            exit 1
            ;;
    esac

    ARCHIVE="${BINARY}-${OS}-${ARCH}.tar.gz"
    printf "Detected platform: %s/%s\n" "$OS" "$ARCH"
}

resolve_version() {
    if [ "$VERSION" = "latest" ]; then
        DOWNLOAD_URL="${BASE_URL}/latest/download"
        printf "Installing latest version\n"
    else
        DOWNLOAD_URL="${BASE_URL}/download/${VERSION}"
        printf "Installing version: %s\n" "$VERSION"
    fi
}

determine_install_dir() {
    # Check for --global flag
    for arg in "$@"; do
        if [ "$arg" = "--global" ]; then
            INSTALL_DIR="/usr/local/bin"
            break
        fi
    done

    if [ -z "$INSTALL_DIR" ]; then
        INSTALL_DIR="${HOME}/.local/bin"
    fi

    # Create install directory if it doesn't exist
    if [ ! -d "$INSTALL_DIR" ]; then
        mkdir -p "$INSTALL_DIR"
    fi

    printf "Install directory: %s\n" "$INSTALL_DIR"
}

download() {
    url="$1"
    output="$2"

    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$url" -o "$output"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO "$output" "$url"
    else
        printf "Error: neither curl nor wget found. Install one and try again.\n" >&2
        exit 1
    fi
}

download_and_install() {
    TMPDIR="$(mktemp -d)"
    trap 'rm -rf "$TMPDIR"' EXIT

    printf "Downloading %s...\n" "$ARCHIVE"
    download "${DOWNLOAD_URL}/${ARCHIVE}" "${TMPDIR}/${ARCHIVE}"

    # Download and verify checksum
    printf "Verifying checksum...\n"
    download "${DOWNLOAD_URL}/checksums.sha256" "${TMPDIR}/checksums.sha256"

    # Extract only the relevant line for our archive
    expected_checksum="$(grep "$ARCHIVE" "${TMPDIR}/checksums.sha256" | cut -d' ' -f1)"

    if [ -z "$expected_checksum" ]; then
        printf "Warning: checksum not found for %s, skipping verification\n" "$ARCHIVE" >&2
    else
        if command -v sha256sum >/dev/null 2>&1; then
            actual_checksum="$(sha256sum "${TMPDIR}/${ARCHIVE}" | cut -d' ' -f1)"
        elif command -v shasum >/dev/null 2>&1; then
            actual_checksum="$(shasum -a 256 "${TMPDIR}/${ARCHIVE}" | cut -d' ' -f1)"
        else
            printf "Warning: sha256sum/shasum not found, skipping checksum verification\n" >&2
            actual_checksum="$expected_checksum"
        fi

        if [ "$actual_checksum" != "$expected_checksum" ]; then
            printf "Error: checksum mismatch!\n" >&2
            printf "  Expected: %s\n" "$expected_checksum" >&2
            printf "  Actual:   %s\n" "$actual_checksum" >&2
            exit 1
        fi
        printf "Checksum verified.\n"
    fi

    # Extract
    printf "Extracting...\n"
    tar xzf "${TMPDIR}/${ARCHIVE}" -C "${TMPDIR}"

    # Install
    if [ -w "$INSTALL_DIR" ]; then
        mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
    else
        printf "Need elevated permissions to install to %s\n" "$INSTALL_DIR"
        sudo mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
    fi
    chmod +x "${INSTALL_DIR}/${BINARY}"

    printf "Installed %s to %s\n" "$BINARY" "${INSTALL_DIR}/${BINARY}"
}

verify_installation() {
    if command -v "$BINARY" >/dev/null 2>&1; then
        installed_version="$("$BINARY" --version 2>/dev/null || true)"
        printf "Verified: %s\n" "$installed_version"
    elif [ -x "${INSTALL_DIR}/${BINARY}" ]; then
        installed_version="$("${INSTALL_DIR}/${BINARY}" --version 2>/dev/null || true)"
        printf "Verified: %s\n" "$installed_version"
    fi
}

print_path_hint() {
    case ":${PATH}:" in
        *":${INSTALL_DIR}:"*) ;;
        *)
            printf "\n"
            printf "Add %s to your PATH:\n" "$INSTALL_DIR"
            printf "\n"
            printf "  export PATH=\"%s:\$PATH\"\n" "$INSTALL_DIR"
            printf "\n"
            printf "Add the above line to your ~/.bashrc, ~/.zshrc, or equivalent.\n"
            ;;
    esac
}

print_setup_hint() {
    printf "\nAgent integrations:\n"
    printf "  cmt setup                # detect and install integrations\n"
    printf "  cmt setup --claude-code  # install Claude Code skill\n"
}

main "$@"
