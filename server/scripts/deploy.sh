[ -e dist ] && rm -r dist
mkdir dist
echo "Bundling..."
deno bundle --config deno.json "main.ts" "dist/server.js"
echo "Sending..."
scp "dist/server.js" "fa404@shell.srcf.net:~/mealbooking/server.js"
echo "Restarting..."
ssh "fa404@webserver.srcf.net" "systemctl --user restart mealbooking"