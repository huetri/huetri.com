#!/bin/bash
list=$(find -wholename ./**/*.jpg)
for file in $list
do
    convert $file -quality 50 -resize 100 ${file/".jpg"/"-min.jpg"}
done

for file in $(find -wholename ./**/*.png)
do
    convert $file -quality 3 -resize 100 ${file/".png"/"-min.png"}
done