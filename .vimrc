set number
set colorcolumn=80
hi ColorColumn ctermbg=darkgrey
filetype plugin indent on
set backspace=indent,eol,start
let g:rustfmt_autosave = 1
syntax on
set expandtab
set textwidth=80
set tabstop=2
set shiftwidth=2

" JavaScript and TypeScript configs
autocmd FileType javascript set tabstop=2|set shiftwidth=2|set expandtab
autocmd FileType typescript set tabstop=2|set shiftwidth=2|set expandtab
autocmd FileType javascript match Error /\t/
autocmd FileType typescript match Error /\t/

" Golang configs
" use tabs, 4 character wide
autocmd FileType go set tabstop=4|set shiftwidth=4|set expandtab!

match Error /\%81v.\+/ " Highlight longlines.
