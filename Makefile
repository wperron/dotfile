all: dotfiles git python node golang rust deno
	echo "applying all targets..."

dotfiles: update_system
	echo "updating config files..."
	cp ./.bashrc ~/.bashrc
	cp ./.gitconfig ~/.gitconfig

git: update_system
	echo "installing git..."
	apt-add-repository -y ppa:git-core/ppa
	apt update -y
	apt install -y git

python: update_system
	echo "installing python..."
	apt install -y \
		python \
		python3 \
		python3-pip

node: update_system
	echo "installing node..."
	curl -sL https://deb.nodesource.com/setup_15.x | bash -
	apt install -y nodejs

golang: update_system
	echo "installing golang..."
	curl --silent https://dl.google.com/go/go1.15.7.linux-amd64.tar.gz -o go1.15.7.linux-amd64.tar.gz
	tar -C /usr/local -xzf go1.15.7.linux-amd64.tar.gz

rust: update_system
	echo "installing rust..."
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs > rustup.sh
	chmod +x rustup.sh
	./rustup.sh -y

deno: update_system
	echo "installing deno..."
	curl -fsSL https://deno.land/x/install/install.sh | sh

update_system:
	echo "running apt updates..."
	apt update -y
	apt install -y \
		curl \
		apt-transport-https \
		zip \
		software-properties-common
