#!/bin/bash

# Exit on errors
set -e

# Function to clean up Docker containers and images
cleanup() {
    echo "Cleaning up Docker containers and images..."
    
    # Remove all running/stopped containers
    docker ps -aq | xargs -r docker rm -f

    # Remove all dangling images
    docker images -q | xargs -r docker rmi -f

    echo "Cleanup complete."
    exit 0
}

setup_openssl() {
    echo "Checking for OpenSSL..."

    # Function to install OpenSSL on macOS
    install_openssl_mac() {
        echo "Checking for Homebrew..."
        if ! command -v brew >/dev/null 2>&1; then
            echo "Homebrew is not installed. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi

        echo "Installing OpenSSL via Homebrew..."
        brew install openssl

        echo "Adding OpenSSL to PATH..."
        echo 'export PATH="/usr/local/opt/openssl/bin:$PATH"' >> ~/.bash_profile
        echo 'export PATH="/usr/local/opt/openssl/bin:$PATH"' >> ~/.zshrc
        export PATH="/usr/local/opt/openssl/bin:$PATH"
        echo "OpenSSL installation complete!"
    }

    # Validate OpenSSL installation
    validate_openssl() {
        if ! command -v openssl >/dev/null 2>&1; then
            echo "OpenSSL is not installed or not in PATH."
            return 1
        fi

        echo "OpenSSL version: $(openssl version)"
        return 0
    }

    # Generate a self-signed SSL certificate
    generate_ssl_certificate() {
        echo "Generating a self-signed SSL certificate..."
        
        OS="$(uname -s)"
        if [[ "$OS" =~ MINGW*|CYGWIN*|MSYS* ]]; then
            SUBJ="//C=CA\ST=ON\L=London\O=Capstone\OU=Homey\CN=localhost"
        else
            SUBJ="/C=CA/ST=ON/L=London/O=Capstone/OU=Homey/CN=localhost"
        fi

        "$(which openssl)" req -x509 -newkey rsa:4096 \
            -keyout "./backend/key.pem" \
            -out "./backend/cert.crt" \
            -sha256 -days 365 -nodes \
            -subj "$SUBJ"
    }

    # Detect operating system and handle accordingly
    OS="$(uname -s)"
    case "$OS" in
        Darwin)
            echo "Running on macOS."
            validate_openssl || install_openssl_mac
            ;;
        MINGW*|CYGWIN*|MSYS*)
            echo "Running on Windows (Git Bash)."

            # Check if OpenSSL exists in Git Bash
            OPENSSL_PATH=$(which openssl)
            if [[ -z "$OPENSSL_PATH" || "$OPENSSL_PATH" != "/mingw64/bin/openssl" ]]; then
                echo "OpenSSL not found or not in the expected path."
                echo "Ensure Git Bash is correctly installed with OpenSSL."
                echo "Reinstall Git for Windows if necessary: https://git-scm.com/"
                exit 1
            fi

            echo "OpenSSL binary found at: $OPENSSL_PATH"
            echo "OpenSSL version: $(openssl version)"
            ;;
        *)
            echo "Unsupported operating system: $OS"
            exit 1
            ;;
    esac

    echo "OpenSSL setup completed successfully!"
    if [[ ! -f "./backend/cert.crt" || ! -f "./backend/key.pem" ]]; then
        echo "Certificate or key file not found. Generating SSL certificate..."
        generate_ssl_certificate
    else
        echo "SSL certificate already exists."
    fi
}

# Trap signals and call cleanup on exit
trap cleanup SIGINT SIGTERM EXIT

# Start frontend setup in the background
start_frontend() {
    echo "Starting frontend ..."
    (
        cd ./frontend || exit
        npx expo install expo@latest
        npx expo install --fix
        npm install
        npx expo start --tunnel &
    )
    sleep 15
}

# Start backend setup in the background
start_backend() {
    echo "Starting backend ..."
    dos2unix ./backend/docker/scripts/wait-for-db.sh
    docker --debug compose -f ./backend/docker/docker-compose.yml up --build
}

# Run OpenSSL setup before backend setup
setup_openssl

# Run frontend and backend setup in parallel
start_frontend
start_backend

docker logs -f $(docker ps -q) 