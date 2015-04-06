---
layout: post
title: First version of Blink on Docker released
---

I'm happy to announce that the first version of Blink on Docker is now available on [GitHub](https://github.com/plaperdr/blink-docker)!
Automated builds of the main containers are also available through [Docker Hub](https://registry.hub.docker.com/u/plaperdr/). 
And thanks to the [new webhook subscription feature)(https://blog.docker.com/2015/04/announcing-webhook-respository-subscriptions/), 
the Docker images are now automatically rebuilt when the images on which they are based are updated.

<div style="text-align:center" markdown="1">
![]({{ "/blog/images/blink-dock-1.png" | prepend: site.baseurl }} "Blink with Docker"){: style="width: 70%"}
</div>

If you want to try it, here are 4 simple commands to get it running:

~~~~~~
git clone https://github.com/plaperdr/blink-docker.git
cd blink-docker/
python3 downloadFromHub.py
python3 run.py
~~~~~~

Here is a list of features included in this release:

* Blink in containers: Apart from the installation and maintenance scripts, everything runs at lightning speed in
Docker containers with the same performance as native applications.
* Up-to-date plugins: One of the main problems with the VirtualBox version of Blink was the difficulty to maintain an
up-to-date reservoir of plugins for all virtual machines. Now, plugins are updated directly from the package manager of
each operating system.
* Easy installation: You can either download the containers or build them yourself with one simple command.
* Automatic updates: A first implementation of automatic updates are included in this release with plans in the future
for a more streamlined and lighter process.

More advanced anti-fingerprinting features are in development and will be added when they are stable and fully tested.
Feedback and bug reports are welcome on [GitHub](https://github.com/plaperdr/blink-docker/issues)!
Stay tuned for a future update on Blink!


