---
title: Catfacts, A postmortem
date: 2016-10-28 18:27 UTC
tags: tech
img: /assets/img/flip_flop_cat.gif
alt: Flip Flop Cat
author: Nick
---

## Intro
So this is a brief cat facts postmortem. There's a bunch to talk about from a technical perspective but I'm just going to focus on the nuggets.
I had never used NodeJs before, and the extent of my js programming was browser side DOM manipulation and Ajax.  I had a few months of using Angular, but still, that's a different beast than server side authentication, ORM data integrity stuff, and other server side operations that a backend language deals with.

My feelings are still mixed on the subject of NodeJs due to how difficult it is, from my perspective, to write clean, readable, maintainable, and robust javascript due to its lexical scoping, asynchronous single threaded nature, and lack of OOP.

Disclaimer: I am not a Node guru, I have worked with Java, Ruby, Python, and PHP, and am just noticing the differences that all of these seem to have from JS. Additionally, I'm sure a guru can write amazing robust maintainable JS in no time, however, a guru of assembly could accomplish the same thing.  I'm just trying to discuss it from the perspective of an regular developer.

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
    dude = Person.find("Dude")
    dude.first_name = "otherdude"
    dude.save
  ~~~~

  I have access to every column of that record in the database and I can assign and change attributes easily.

  It seems impossible to be more elegant and simple than that.

  Mongoose was not this elegant and simple. You have to  create a schema, then a model, then to extend it you have to create a discriminator...
  I'm not going to go into the details, but for a premier ORM, with one of the most starred and contributed packages on npm, it wasn't even close to the simplicity and ease of Active Record.

  And I don't even blame the creators at all. Certainly, I think the ORM is the absolute best you can do within the confines of the Javascript language.

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

  Deeply nested asychronous calls are nasty. They look nasty, are hard to reason about, and are bloated as all get out. Promises are a solution and keep things more readable, however, Node and npm libraries seem to love the callback and then infinite copy/paste of error handling:

  ~~~~
    if(err){
      console.log(err)
      throw err;
    } else {
    //do fun stuff!
    }
  ~~~~



* ### Summary
  I think I'm spoiled from using Ruby and Rails as a web language. It's like that girl you date who's basically got it all figured out, she's got a good career, a nice house, a good family, she cooks healthy food and does yoga...buuuut you have to watch yourself around her. No overt alcholism, no nose picking. She gives you structure.

  Javascript(and it's ecosystem) are different. The JS world is that girl the girl in the leather jacket rooting for you to drink a shot at some bar ya'll stopped at on your roadtrip to Mexico. She scratches her crotch with a fork.
  She has ALOT of quirks and is very dirty if you're not careful, but moves fast, there's not much you can't do with her, and she is down for going anywhere.

  She can handle a database AND a three dimensional graphics library in the browser. She can do it Backend, Frontend, and, Mobile....
  She can handle heavy amount of users.
  Development can be fast.... You can do anything with her but you might painfully look back and regret what you did.

  Also, at times she will start freaking out over the most trivial reasons...she will make things way more complicated than they have to be..and you will often question your sanity for dating her.

  She can offer you alot...but you just have to deal with those rough edges...


* ### Outro

  I guess the conclusion here is that Javascript is a mixture of pain and pleasure. I really enjoyed that I was able to build this app and I can translate those skills to both front end  and backend. That I'm able to pick up Three.js, or Babylon.js, or Websockets easily and can start developing browser games, better UI's, or backend CRUD.

  I feel simultaneously that it's not optimal the code that JS forces you to write. Compared to other languages like Ruby, Go, or Python, Javascript, with their elegant syntax, JS offers no better features and is much less readable, more bloated, and has a lot of unnecessary quirks.

  I think the only singular reason people voluntarily choose javascript over other languages is because of its browser monopoly. You have no choices browser side.

  Even Brendan Eich the creator of Javascript has apologized for it and said he created it in 10 days. In his defense: who knew?  He is also working on Web Assembly to replace it.

  With web assembly in the pipeline to allow a binary compilation target and near native OS speeds, I think this will transcend the browser to something beyond JUST web apps and web sites. What that is remains to  be seen...but as they say: "I for one, can't wait."







