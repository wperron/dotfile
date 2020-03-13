all: dotfiles git python node

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
		python-pip \
		python3 \
		python3-pip

node: update_system
	curl -sL https://deb.nodesource.com/setup_13.x | bash -
	apt install -y nodejs

update_system:
	apt update -y
	apt install -y \
		curl \
		apt-transport-https \
		zip \
		software-properties-common