---
date: 2022-10-31
type: 'page'
---

If you are going to use apache instead of nginx on a local server, the
first rule is: this is not the standard deployment on the lacuna
servers.  So there will be a certain amount of "this is not really
supported."  However, I've been running this for a while and it seems
to work.

These instructions do not replace setup_a_server.txt in its entirety,
but only the parts dealing with nginx.

I'm using the apache that comes with the OS, so there's no
"start_apache.sh" - use your OS method of starting services.  On
most systems, you can usually do "/etc/init.d/apache start" or
something similar, but there are ways to get it to start automatically
on reboot, check your distribution's documentation.

It's the configuration that is the most challenging.

So, I have all of the repositories linked in /data, partly because the
perl server requires it.  But I expand LSO a little bit

### create the directories
# mkdir /data
# cd /data
# mkdir Lacuna-Server-Open
# cd Lacuna-Server-Open

### link in the contents
# ln -s /path/to/git/repo/Lacuna-Server-Open/* .

### expand the etc directory
# mv etc etc.link
# mkdir etc
# mv etc.link/* etc
# rm etc.link

### now you can go into etc to create your lacuna.conf, etc.
# cd etc
# cp lacuna.conf.template lacuna.conf
# cp log4perl.conf.template log4perl.conf
### edit the new files, they won't show up in your git repository

Do the same thing for Lacuna-Web-Client, etc., except that you can get
away without expanding subdirs:

# cd /data
# ln -s /path/to/git/repo/Lacuna-Web-Client
# ln -s /path/to/git/repo/Lacuna-Assets
# ln -s /path/to/git/repo/Lacuna-Mission

Then continue with setup_a_server until we get to configuring and
starting nginx.  Here we configure apache.  You need to check how your
distribution sets up apache.  For example, in your httpd.conf may be a
line like this:

  Include /etc/apache2/vhosts.d/*.conf

That will load any conf file in that vhosts.d directory.  This will
allow you to create a file, say "lacuna.conf" in that directory that
has the following:

<VirtualHost *:80>
	ServerName my.lacunaexpanse.com
DocumentRoot /data/Lacuna-Web-Client/
ServerRoot /data/Lacuna-Web-Client/

    <Directory "/data/Lacuna-Web-Client/">
            Options Indexes MultiViews FollowSymLinks
            Require all granted
    </Directory>

    <Directory "/data/Lacuna-Assets">
            Options Indexes MultiViews FollowSymlinks
            Require all granted
    </Directory>

    <Directory "/data/captcha">
            Options Indexes MultiViews FollowSymlinks
            Require all granted
    </Directory>
    <Directory "/data/Lacuna-Server-Open/var/www/public">
            Options Indexes MultiViews FollowSymlinks
            Require all granted
    </Directory>


    alias /captcha "/data/captcha"
    alias /assets  "/data/Lacuna-Assets"
    alias /chiselchat "/data/Lacuna-Server-Open/var/www/public/chiselchat"

ProxyPassMatch ^/([a-z][^.]*)$ http://localhost:5000/$1
ProxyPreserveHost On
RemoteIPHeader X-Real-IP

	<IfModule mpm_peruser_module>
		ServerEnvironment apache apache
	</IfModule>
</VirtualHost>

The only thing missing at this point is the index.html that you need.
According to the above configuration, that will be found in
/data/Lacuna-Web_client/index.html - that will require you to copy it
from us1 and change it slightly.

Restart apache.  Once you have the dev server running, you should be
able to connect.  Recommended is to add something like this to your
/etc/hosts:

127.0.0.1  my.lacunaexpanse.com

That way you can put "http://my.lacunaexpanse.com" in your browser and
connect to this site, even if you're also using apache to serve other
domains.
