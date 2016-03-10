---
layout: post
title: Forcing HTTPS connection in a Play application
---

While building the AmIUnique.org website, I put in place signed certificates to assure that the information sent by our visitors is encrypted to our server.
However, I encountered a problem inside the application where I could not find an easy way to force a HTTPS connection from a non-secure HTTP connection.
In this blog post, you will find a concise and easy way to force HTTPS on all connections in a Play application.

<div style="text-align:center" markdown="1">
![https://www.playframework.com/]({{ "/blog/images/play.png" | prepend: site.baseurl }} "Play framework logo"){: style="width: 50%"}
</div>

Before trying to find a solution specific to Play, my first idea was to put a front-end server to deal with the inbound connections but the main problem here lied in
the fact that the server filtered and modified the HTTP headers sent by the client. Since I am investigating browser fingerprinting, the smallest piece of
information is important to me so this solution was less than ideal to get precise and meaningful data. With that in mind, I had to find a solution that could
be directly implemented inside the AmIUnique server. As the Play framework has well evolved in the past few years, I found some code snippets on the Internet
that were either not working or much bigger than I anticipated. After some research, I came up with a solution that is far simpler than what I found.

## Detecting the type of the connection
Before version 2.3, you had to manually check for the "s" in the current URL or check for the presence of the "X-Forwarded-Proto" HTTP header.
Now, from version 2.3 and onwards, the Play framework has a built-in **secure()** function for every request that does the verification for you.
It returns *True* if the client is ussing SSL.  
We can then start writing our code.

```java
if (!ctx.request().secure()) {
    //Redirection
}
```

## Modifying the URL
Since the certificate issued for the AmIUnique website did not cover the "www" version of the URL, we need to both redirect the client to HTTPS and remove the **www**.

```java
if (!ctx.request().secure()) {
    redirect("https://"
            + ctx.request().host().replace("www.","")
            + ctx.request().uri()));
}
```
+ **Line 2**: We change HTTP to HTTPS.
+ **Line 3**: We remove the *www* from the host URL
+ **Line 4**: We put back the URI path so that we do not redirect the client to the main page

## Checking the status of connection before every requests
Here is the final piece of the puzzle: how do we make sure that Play checks if the connection is secure for every request?  
In Play, most of the requests are handled by an **Action**. As indicated by [the documentation](https://www.playframework.com/documentation/2.0/JavaActions), an "action is basically a Java method that processes the request parameters, and produces a result to be sent to the client". So, let's build an action that will redirect the user to the correct URL!

```java
public class ForceHttps extends Action.Simple {
    @Override
    public F.Promise<Result> call(Http.Context ctx) throws Throwable {
		//Code to redirect the client
    }
}
```

Finally, when your action is ready, you need to compose it with the main actions of your controller so that it is correctly called before every request (the Controller class is basically a group of actions).

```java
@With(ForceHttps.class)
```
One line before the main controller class declaration and it is done!

## The complete solution

#### ForceHTTPS.java <a class="btn btn-secondary git" href="https://github.com/DIVERSIFY-project/amiunique/blob/master/website/app/controllers/ForceHttps.java"><i style="vertical-align: middle" class="fa fa-github fa-2x"></i>View on GitHub</a>
```java
package controllers;

import play.libs.F;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Result;

public class ForceHttps extends Action.Simple {

    @Override
    public F.Promise<Result> call(Http.Context ctx) throws Throwable {

        if (!ctx.request().secure()) {
            return F.Promise.promise(() -> redirect("https://" + ctx.request().host().replace("www.","")
                    + ctx.request().uri()));
        }

        return delegate.call(ctx);
    }

}
```

#### Application.java <a class="btn btn-secondary git" href="https://github.com/DIVERSIFY-project/amiunique/blob/master/website/app/controllers/Application.java#L22"><i style="vertical-align: middle" class="fa fa-github fa-2x"></i>View on GitHub</a>
```java
package controllers;

@With(ForceHttps.class)
public class Application extends Controller {...}
```

There you have it: a simple and quick way to force HTTPS with a Play application! If you have any remarks or suggestions, do not hesitate to contact me! See you in the next post!
