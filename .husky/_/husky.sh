#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  export husky_skip_init=1
  sh -e "$0" "$@"
  exit $?
fi

command_exists () {
  command -v "$1" >/dev/null 2>&1
}

if command_exists pnpm; then
  pnpm install >/dev/null 2>&1
fi
