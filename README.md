
# ASIDE.IO

ASIDE.IO is **A** **S**alesforce **IDE** that is fast, free, and easy to use. It is full-featured and supports the entire Salesforce development cycle from writing code, to running unit tests, querying/managing data, and deploying the resulting application.  There is no download required to start using ASIDE.IO, it lives in the cloud as a web app, and is happy to be up there.

## Getting Started

In order to use this code, you will either need to run it locally or as a heroku app.  The steps below describe both processes.

### Prerequisites

To run ASIDE locally you will need:

* Ruby 2.5.7
* Bundler
* A Salesforce Org that you're admin in
* A Heroku account

### Running Locally

First, create a heroku app, visit [https://devcenter.heroku.com/articles/creating-apps](https://devcenter.heroku.com/articles/creating-apps) for instructions.
```
$ mkdir aside-deploy-example
$ cd aside-deploy-example
$ git init
$ heroku apps:create aside-deploy-example
```
Put ASIDE's source code in the directory you just created.  Now you should be ready to run ASIDE locally.  Execute the command below which will create a web server running ASIDE. 
```
$ heroku local
```
Now open your internet browser of choice, and navigate to: 
```
http://<my ip address>:5000/login
```
...And now you're running your own instance of ASIDE!  

### Logging In

You'll probably want to be able to get past the login page, and the usual login buttons aren't going to work for that, due to how the OAuth is configured.  However, you can use the "frontdoor" login endpoint to get in.  To use the frontdoor login, you will need the *org id* of the org you want to log into, your *user id*, the *instance name* (e.g. *na12*), the *endpoint type* (*login* for production/developer edition, *test* for sandboxes), and have an *api session id*.

The *org id* and *instance name* both appear on the "Company Information" screen (setup -> Company Information).

Your *user id* is accessible from the url of your user detail page.

The *endpoint type* is just a static string value.  "login" for production and developer edition orgs, and "test" otherwise.

Getting an *API session id* is slightly more complicated.  You can obtain one by logging into ASIDEs backend from `irb`.  Try the following series of commands.  The *\<login endpoint\>* should be something like https://login.salesforce.com or https://test.salesforce.com.

```
$ irb
2.5.7 :001 > require './D3VController'
2.5.7 :002 > ctrl = D3VController.new('<username>', '<password>', '<security token>', '<login endpoint>')
```

When the second command is successful it outputs a block of information which includes the session id.  The session id is found in the `@session_id` parameter.

With this information you can use the frontdoor login.  Visit the following url in your browser when `heroku local` is running.
```
http://<my ip address>:5000/frontdoor?ins=<instance name>&oid=<org id>&uid=<user id>&end=<endpoint type>&sid=<session id>
```
* `<instance name>` is from the Company Information screen.  e.g. na13
* `<org id>` is the id of the org you are trying to log into
* `<user id>` is the id of the user you are trying to login as
* `<endpoint type>` is *login* or *test* depending on the org type
* `<session id>` is the string of characters you obtaining from `irb`

When successful, you should be at ASIDE's main screen, same as if you had used the OAuth login.

### Deployment to Heroku

Once you have ASIDE running locally, getting it deployed to Heroku is simple.  First, tell Heroku which stack you want this app to use.
```
heroku stack:set heroku-18
```
Next install Bundler and ASIDE's dependencies.
```
gem install bundler
bundle install
```
Finally, push the code to Heroku.
```
git commit -a -m "deploying aside"
git push heroku master
```
Now you should be able to access your instance of ASIDE hosted on heroku!  Unfortunately the login buttons still won't work because you havent configured OAuth.  To do that, follow the steps in the next section.

### Configuring OAuth

Ya gotta write this bro.  Are all these instructions moot when im adding a deploy to heroku button?

## Built With

* [Sinatra](http://sinatrarb.com/) - Ruby web application library
* [jQuery](https://jquery.com/) - JavaScript DOM manipulation library
* [ACE Editor](https://ace.c9.io/) - Embeddable code editor written in JavaScript
* [RForce](https://github.com/undees/rforce) - Salesforce Partner API Ruby binding
* [Slickgrid](https://github.com/mleibman/SlickGrid) - A lightning fast JavaScript grid/spreadsheet
* [Bootstrap](https://getbootstrap.com/) - Front end web development framework
* ...and *many* more!

## Authors

* **Phil Rymek** - *Initial work* - [fillip](https://github.com/fillip)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details