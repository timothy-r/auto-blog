# Auto-Blog

A serverless application that generates HTML pages from S3 objects (text, markdown, images) and puts them to a static web site.

# Functions

## upload
* Consumes upload bucket events
* Publishes events for mdFilter, textFilter, imageFilter lambdas

## textFilter
* Generates HTML snippet for text files
* Publishes events for render lambda

## mdFilter
* Generates HTML snippet for markdown files
* Publishes events for render lambda

## imageFilter
* Copies image files to web bucket
* Publishes events for imagePage lambda

## imagePage
* Generates HTML snippet for images
* Publishes events for render lambda

## render
* Generates full HTML page
* Copies HTML pages to web bucket
* Publishes events for indexFilter lambda

## indexFilter
* Splits new page paths into seb-paths 
* Publishes events for directoryPage lambda

## directoryPage
* Generates contents of directory index pages
* Publishes events for render lambda