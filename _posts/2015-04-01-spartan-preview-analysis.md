---
layout: post
title: Fingerprinting "Project Spartan", Microsoft's new browser
---

Less than 48 hours ago, Microsoft publicly released the first version of its new browser codenamed "Project Spartan" 
in the Windows 10 Developer Preview . This browser will replace Internet Explorer as the default Windows browser. 
What a better way to celebrate this release than with some browser fingerprinting?

<div style="text-align:center" markdown="1">
![]({{ "/blog/images/spartan-1.png" | prepend: site.baseurl }} "This is SPARTAN!"){: style="width: 70%"}
</div>

###User-agent
First, let's start with the user-agent. I added the user-agent found on Internet Explorer 11 for comparison. 

* IE 11 on W8: ``Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko``
* Spartan on W10: ``Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0``

At first glance, the user-agent exposed by the Spartan browser seems far from the final one.
First, Microsoft has not decided on the final name of its browser yet and it is highly likely that this name will be included in the user-agent by the time Windows 10 is released.
Second, the developers seem to have copied the user-agent found on Chrome browsers for testing purposes ([which itself is based on Safari UA...](http://webaim.org/blog/user-agent-string-history/))
but in the case of Spartan, it has absolutely no meaning since the browser is based on a completely new rendering engine called "Edge" with their in-house JavaScript engine named "Chakra". 
Spartan has nothing to do with Gecko or WebKit which is really surprising given the user-agent that is being presented. At least, the developers are proving two points:

* You cannot trust blindly the information given by any HTTP headers because it can be easily modified to tell any story.
* The namings of current user-agents are getting completely out of hand.

Nevertheless, if we take a closer look at the user-agent, the key word we can found is **Edge**. Microsoft forked their Trident rendering engine to create "Edge" and it is being used 
for the first time to power Spartan. Then, we can see that they finally decided to leave the **6.X** versions of Windows NT and move to **Windows NT 10.0**. We can also notice that the
class of the CPU (here **x64**) has been added. Finally, Spartan seems to be a native 64-bit browser as reflected by **Win64**.
For comparison, as reported by the fingerprints collected on [AmIUnique.org](https://amiunique.org), the default version of IE on Windows 8 is the 32-bit version and it returns **WOW64** 
(Windows 32-bit on Windows 64-bit) for the platform even though a 64-bit version of IE exists. 

###HTTP Accept header
``text/html, application/xhtml+xml, image/jxr, */*``  
The real surprise here is the addition of **image/jxr**. Spartan seems to be the first browser in the world to support natively images encoded with the
[**JPEG XR**](https://msdn.microsoft.com/en-us/library/windows/desktop/hh707223(v=vs.85).aspx) codec. Developed by Microsoft, this format is supposed to 
have a better compression rate than the standard JPEG. Firefox may include support for this type of file in the future (as indicated by 
[this ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=500500)).

###Plugins
``Plugin 0: Shockwave Flash; Shockwave Flash 17.0 r0; Flash.ocx.``  
Flash was already installed in the Developer Preview without me installing it. I don't know if users will have to download it manually in the final version or if it will be automatically provided with Spartan and updated at the same time (a la Chrome).  
The **ocx** file format indicates that Microsoft is still using the ActiveX framework
and has not shifted to the PPAPI plugin architecture (or reimplemented the NPAPI architecture since it has been dropped from IE6).


###Platform from Flash
``Windows 8.1``  
On Linux, the Flash plugin directly asks the system to retrieve the information regarding the current platform. For Windows, I haven't had the opportunity 
to find out where this value comes from: is it somehow hardcoded in the plugin during its installation? Does it ask the system for this value? 
Either way, it seems that the plugin has not been updated yet to return **Windows 10**.

###WebGL

* WebGL vendor: ``Microsoft``
* WebGL renderer: ``Microsoft Basic Render Driver``

These values may be due to the fact that I'm running Windows 10 in a virtual machine but they can also be observed with IE11.

###Final words
Regarding browser fingerprinting, it is too soon to draw conclusions but Spartan seems to be following the trend of modern browsers and 
nothing really groundbreaking stands out from the information that I collected. It will be interesting to see if Microsoft plans to implement
some advanced privacy features in the future but if the small privacy settings section is any indication, advances in privacy does not seem
to be really high on their roadmap for the moment.

<div style="text-align:center" markdown="1">
![]({{ "/blog/images/spartan-2.png" | prepend: site.baseurl }} "Spartan's only privacy settings")
</div>

In the end, Spartan looks to be a step in the right direction for Microsoft. The new rendering engine seems to be performing
much better than Trident and I like the fact that Spartan wants to differentiate itself from the pack with built-in 
functionalities that you cannot find anywhere else. Will Spartan succeed where IE truly failed in the past few years? 
This remains to be seen but Microsoft is on the right track to reconquer some lost market share in this wild battle for browser
supremacy. For me, what is truly lacking and what will surely slow the spread of this new browser is the fact that 
Spartan does not have a proper extension API. Extensions are a cornerstone of modern browsers and without a proper support,
I do not see Microsoft getting back to play at the same level as the big boys if they do not open their browser to them.
