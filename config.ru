# config.ru
require './web'
$stdout.sync = true
run Sinatra::Application
