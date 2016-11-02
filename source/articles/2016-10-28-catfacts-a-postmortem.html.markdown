---
title: Catfacts, A postmortem
date: 2016-10-28 18:27 UTC
tags: tech
img: /assets/img/flip_flop_cat.gif
alt: Flip Flop Cat
author: Nick
---

## Intro
So this is a brief cat facts postmortem. There's a bunch I would love to talk about from a technical perspective but I'll keep it sorta short.
I had never used NodeJs before, and the extent of my js programming was browser side DOM manipulation and Ajax.  I had a few months of using Angular, but still, that's a different beast than server side authentication, ORM data integrity stuff, and other server side operations that a backend language deals with.

My feelings are still mixed on the subject of NodeJs due to how difficult it is, from my perspective, to write clean, readable, maintainable, and robust javascript due to its lexical scoping, asynchronous single threaded nature, and lack of OOP.

Disclaimer: I am not a Node guru, I have worked with Java, Ruby, Python, and PHP, and am just noticing the differences that all of these seem to have from JS. Additionally, I'm sure a guru can write amazing robust maintainable JS in no time, however, a guru of assembly could accomplish the same thing.  I'm just trying to discuss it from the perspective of average developers with deadlines.

## Catfacts Architecture
I divided my app into a typical MVC pattern with a cron job running the actual sending of the catfacts based on a user set time interval.
I used Mongoose for the 'M', EJS for the 'V', and Express for the 'C' and just a raw Node script for the cron job.


* ### Mongoose
  Mongoose was a bit of a beast after using Active Record for so long. Data Models are Object Oriented by nature, i.e., I can create a 'Person' Object which I can then extend to create a 'Catfacts_Person' Object. This seems intuitive and in active record it's a breeze to create models and extend models. I mean Active Record model creation is literally two lines of code:


  ~~~~
    class Person < ApplicationRecord
    end
  ~~~~

  ~~~~
    class CatFacts_Person < Person
    end
  ~~~~

  And to find a person and change it's name:

  ~~~~
    dude = Person.find_by(first_name: 'Dude')
    dude.first_name = "otherdude"
    dude.save
  ~~~~

  I have access to every column of that record in the database and I can assign and change attributes easily.

  It seems impossible to be more elegant, simple, and readable than that.

  Mongoose was not this elegant and simple. You have to create a schema, then a model, then to extend it, you have to create a discriminator...and all querys use callbacks.

  I'm not going to go into the details, but for a premier ORM, with one of the most starred and contributed packages on npm, I didnt find it near the simplicity, readability, and ease of use as Active Record.

  And I don't even blame the creators for extra cruft at all. Certainly, I think the ORM is the absolute best you can do within the confines of the Javascript language.

* ### Express

  I really enjoyed using Express. I was rocking and rolling with it shortly after reading up on it. The pipeline format is very elegant and intuitive and building your response with middleware is fun.


  I tried to keep ALL data manipulation out of Express and inside of my ORM. I pretty much simply used Express for orchestrating connections between Mongoose and EJS with the occasional weed out of un-needed fields before sending a JSON object to the view.

  The one esoteric but niggling issue I had with Express was: when to use the request vs response object. Obviously you're reading all your POST variables from the request object... but what if I want to assign some data to a variable that the views will be able to access?
  Do I assign that variable/data to request or response objects? I technically can use both!! The answer I came up with is that while both are usable, the recommended practice is to use the response object for everything...Apparently.... it's no longer a request once it enters the app...by the time it hits your app and middleware you're building the response.

  [Stack Overflow 1](http://stackoverflow.com/questions/39987794/what-is-conceptual-best-practice-for-express-req-locals-vs-res-locals)


  [Stack Overflow 2](http://stackoverflow.com/questions/33451053/req-locals-vs-res-locals-vs-res-data-vs-req-data-vs-app-locals-in-express-mi?noredirect=1&lq=1)

* ### EJS
  This is basically a slightly <s>shittier</s> more streamlined ERB. I had to install another package called EJS-layouts to be able to use layouts and there was no built in syntax for conditionals or loops, so using raw JS gets bloated pretty fast. For [example](https://github.com/nick-catfacts/catfact-express/blob/master/views/dashboard/payment/_output_payment_info.ejs#L4).

  There were a ton of other templating options which I'll look into one day, I just didn't want to get too involved with the templating engines.  Jade looked really neat. Super simple, elegant, html codez.  Basically what the Emmett plugin does for you except with an complimentary extra compilation step and Jade is possibly maybe more readable than HTML depending on who you ask?...

* ### Cron Job
  This is the meat of the project. The app handles the user management but this script is what actually sends the messages.

  In the main app, the user adds a catfacts 'recipient' to his account, and then sets an 'interval' on that recipient.  The interval is a time in minutes of how often that 'recipient' is supposed to receive a catfact text message. This cron job scripts takes a modulus of the interval with the current time and if that result equals zero...boom...a helpful, handy catfact is sent out.

  I used <s>Twilio</s> Plivo to send the texts.

  This was where I had a major struggle with the experience known as callback hell. I had to fetch all users, get one user from that collection, get that users recipients, get that recipients interval and modulus that with the current time, send a message, then adjust the users messages remaining to reflect a message sent. Most of these operations are asynchronous.....

  Deeply nested asychronous calls are nasty. They look nasty, are hard to reason about, and are bloated as all get out. Promises keep things more readable but really aren't a solution for the fact that JS is a single threaded language and these calls are baked in. Unlike Ruby or Php where 


* ### Summary
  I think I'm spoiled from using Ruby and Rails as a web language. It's like that girl you date who's basically got it all figured out, she's got a good career, a nice house, a good family, she cooks healthy food and does yoga. It's like she's perfectly made for you...buuuut you have to watch yourself around her. No overt alcholism, no nose picking. She gives you structure.

  Javascript(and it's ecosystem) are different. The JS world is the girl in the leather jacket rooting for you to drink a shot at a badass bar ya'll stopped at on your roadtrip to Mexico.
  Shes really easy to get started with, but can get you in trouble real fast if you don't watch yourself. She moves fast, can do really cool things, and is down for going anywhere.
Development can be fast and fun.... but you have to be careful of the rough patches!

  (I hope that didn't come off as sexist. You could flip the word girl with guy and it would still apply well.) 

* ### Outro

  I guess the conclusion here is that Javascript is a mixture of pain and pleasure. I really enjoyed that I was able to build this app and I can translate those skills to both front end and backend. There's features of JS I like, such as first class functions, the prototype system, and fast and loose object definitions.  However, I'm not really enjoying the concurrency model of Node or the scoping of Javascript and dont feel that it's optimal the code that JS forces you to write. Compared to other languages like Ruby, Python, or Go, I feel JS is less readable, has more bloat, is harder to  reason about, and has a lot of unnecessary quirks to deal with...all without offering more compelling language features.

  I think the singular reason people have historically chosen javascript over other languages is because of its browser monopoly. You have no other choices browser side and devs are just adapting by bringing it server side.

  Even Brendan Eich the creator of Javascript said he created it in 10 days and is working on Web Assembly to allow a lower level compilation target to build new languages. In his defense: the web was such a baby then..who knew? The original netscape specifications just needed a language to make fonts blink and Geocities websites sparkle.

  With web assembly in the pipeline to allow a binary compilation target and near native OS speeds, I think this will transcend the browser to something beyond JUST web apps and web sites. What that is remains to  be seen...but I for one, can't wait.







