Client-side-only HTML5 content management system for S3
===

Static Site, or S2, is an HTML5 content management system hosted completely from Amazon S3.
Websites are administered and pages are edited directly on S3 through a Javascript client.
There is no server-side component other than your S3 bucket.

S2 includes security and provides many features other traditional content management systems provide such as templates.
[AES](http://en.wikipedia.org/wiki/Advanced_Encryption_Standard) is used to securely store your S3 key and secret so
a memorable username and password may be used instead. Web pages are rendered in-memory using Javascript templating and
stored to their rightful location in S3.

**Still under development. Right now the most you can do is register your user account and later sign in.**

**Getting Started**

_There could be a simple service to do all this for you, but until then you have to handle it manually._

To get started sign up for an [Amazon web services account](http://aws.amazon.com/) and [S3](http://aws.amazon.com/s3/)
if you aren't already.

You may then create a new S3 bucket from [Amazon's console](http://aws.amazon.com/console/). You need to set the policy
file on the bucket. To do this right-click on the bucket in the console and choose "Properties". Choose the "Add bucket
policy" link in the properties and paste this in (be sure to replace "mybucket" with your bucket's name:

	{
		"Version": "2008-10-17",
		"Id": "1",
		"Statement": [
			{
				"Sid": "1",
				"Effect": "Allow",
				"Principal": {
					"AWS": "*"
				},
				"Action": "s3:GetObject",
				"NotResource": "arn:aws:s3:::mybucket/api/*"
			}
		]
	}

Then select the "Website" tab, check "Enabled" and put in "index.html" and "error.html" for the two fields.

From the "Website" tab you'll see the S3 domain you must use to have the website feature. If your bucket is called
"www.example.com" you can point your www.example.com domain's DNS to this S3 domain using CNAME to access your S3 website
from http://www.example.com/.

Finally upload the contents of the public directory of your cloned git project to your S3 bucket (make them public-read
and set their content-type appropriately, e.g. text/html, text/css, text/js).

You should be able to go to the url http://www.example.com/admin/ or https://s3.amazonaws.com/www.example.com/admin/ and
be presented with the login
page. Click Register and put in your info, then you'll be taken to the blank dashboard page. Later you can come here
and login with the username/password you registered with. Note that because Amazon only allows GETs for the website URL
(www.example.com) you are redirected to https://s3.amazonaws.com/www.example.com/admin/ when you go to the admin
directory at http://www.example.com/admin/.

You can see [www.staticsite.org](http://www.staticsite.org/) set up with the code and if you go to
[www.staticsite.org/admin](http://www.staticsite.org/admin/) you'll be redirected to the correct URL for logging in, though you
won't be able to register with that bucket.

**Building**

To build the project you need node.js installed, npm, and CoffeeScript. You can get instructions on installing
[node.js](http://nodejs.org/) from their website and [npm](http://npmjs.org/) from their website. To install
CoffeeScript run `npm install -g coffee-script` with the global flag.

Once everything is installed go to the root of your project and run `npm install` to install required modules. Then you
can run `cake make` to compile the coffeescript in the src/ folder, and
`cake -k aws_key -s aws_secret -b www.example.com make` to compile and upload the files to your bucket.

If you have any problems or issues you're on your own. Sorry. It's still early.