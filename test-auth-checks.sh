for file in convex/*.ts; do
  awk '/mutation\(\{/ {in_mut=1}
       in_mut && /const userId = await getAuthUserId/ {found_auth=1}
       in_mut && found_auth && /if \(!userId\)/ {ok=1}
       /\}\);/ {
         if (in_mut && found_auth && !ok) print FILENAME ":" NR " Missing auth check";
         in_mut=0; found_auth=0; ok=0;
       }' $file
done
