{
  description = "fulala-live-menu dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            nodejs_22
            direnv
            nix-direnv
          ];

          shellHook = ''
            echo "fulala-live-menu dev shell ready — bun $(bun --version), node $(node --version)"
          '';
        };
      });
}
