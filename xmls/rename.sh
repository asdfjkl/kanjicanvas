for files in *.new
do
 mv "$files" "${files%.new}"
done
