Static Site is a content management system hosted on Amazon's S3 and administered from S3 through a Javascript client.
It includes security and hopefully will provide many features other traditional content management systems provide.

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
"mywebsite.com" you can point your mywebsite.com domain's DNS to this S3 domain using CNAME to access your S3 website
from http://mywebsite.com/.

Finally upload the following files from the src/ folder of your cloned git project to your S3 bucket (set their
content-type appropriately, e.g. text/html, text/css, text/js):

* index.html
* error.html
* admin/index.html
* admin/css/admin.css
* admin/js/admin.js
* admin/login.html
* admin/dashboard.html

You should be able to go to the url https://s3.amazonaws.com/mybucket/admin/index.html and be presented with the login
page. Click Register and put in your info, then you'll be taken to the blank dashboard page. Later you can come here
and login with the username/password you registered with. Note that because Amazon only allows GETs for the website URL
you cannot login to the admin from the same URL you access the website from.

You can see [staticsite.org](http://staticsite.org/) set up with the code and if you go to
[staticsite.org/admin](http://staticsite.org/admin/) you'll be redirected to the correct URL for logging in, though you
won't be able to register with that bucket.

**Building**

To build the admin.js you need node.js installed, npm, and uglify-js installed. You can get instructions on installing
node.js from their [website](http://nodejs.org/), npm from their [website](http://npmjs.org/), and uglify by calling
"npm install uglify-js" from the command line.

Once everything is installed go to the root of your project and run `./make.sh`

If you have any problems or issues you're on your own. Sorry. It's still early.