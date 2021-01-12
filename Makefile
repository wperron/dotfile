all: dotfiles git python node golang rust deno

dotfiles: update_system
	cp ./.bashrc ~/.bashrc
	cp ./.gitconfig ~/.gitconfig

git: update_system
	apt-add-repository ppa:git-core/ppa
	apt update -y
	apt install -y git

python: update_system
	apt install -y \
		python \
		python3 \
		python3-pip

node: update_system
	curl -sL https://deb.nodesource.com/setup_14.x | bash -
	apt install -y nodejs

golang: update_system
	curl --silent https://dl.google.com/go/go1.15.6.linux-amd64.tar.gz -o go1.15.6.linux-amd64.tar.gz
	tar -C /usr/local -xzf go1.15.6.linux-amd64.tar.gz

rust: update_system
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -y

deno: update_system
	curl -fsSL https://deno.land/x/install/install.sh | sh

update_system:
	apt update -y
	apt install -y \
		curl \
		apt-transport-https \
		zip \
		software-properties-common
