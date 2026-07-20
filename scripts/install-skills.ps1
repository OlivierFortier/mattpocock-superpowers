[CmdletBinding()]
param()

npx.cmd --yes skills add OlivierFortier/mattpocock-superpowers --all --copy --global
exit $LASTEXITCODE
