			var canvas;
			var context;
			var proton;
			var renderer;
			var emitter;
			var index;
			var randomBehaviour;
			var gravity;

			var mobileContext;
			var mobileCanvas;

			var proton_settings = {
				life: 2,
				radius: {
					x:6,
					y:6
				}
			}
			
			Main();
			function Main() {
			

				if(window.innerWidth >= 750){
				 	loadImage();
				}
				else{
					loadMobileImage();
				}
			
			}

			function loadMobileImage(){
				canvas = document.getElementById("particleCanvas");
				canvas.width = 400;
				canvas.height = 400;
				proton_settings.life = 1;
				proton_settings.radius.x = 5;
				proton_settings.radius.y = 5;

				//alert(canvas.width + " " + canvas.height)
				//html5 stuff
				context = canvas.getContext('2d');
				context.globalCompositeOperation = "lighter";	

					// load image
				var image = new Image();

				image.onload = function(e) {
					e.target.width = canvas.width
					e.target.height = canvas.height

					var rect = new Proton.Rectangle( 
						0, 
						-50, 
						e.target.width, 
						e.target.height);
					context.drawImage(e.target, rect.x, rect.y);
					createProton(rect);
					tick();
				}
				image.src = '/assets/img/icons/mutant_city_small_text_2.png';
			}


			function loadImage() {
				canvas = document.getElementById("particleCanvas");
				canvas.width = 1300;
				canvas.height = 800;

				//alert(canvas.width + " " + canvas.height)
				//html5 stuff
				context = canvas.getContext('2d');
				context.globalCompositeOperation = "lighter";	

					// load image
				var image = new Image();

				image.onload = function(e) {
					e.target.width = canvas.width
					e.target.height = canvas.height

					var rect = new Proton.Rectangle( 
						0, 
						-50, 
						e.target.width, 
						e.target.height);
					context.drawImage(e.target, rect.x, rect.y);
					createProton(rect);
					tick();
				}
				image.src = '/assets/img/icons/mutant_city_text.png';

			}


			function createProton(rect) {
				proton = new Proton;
				emitter = new Proton.Emitter();
				//setRate
				emitter.rate = new Proton.Rate(new Proton.Span(11, 15), new Proton.Span(.02));
				//addInitialize
				emitter.addInitialize(new Proton.Position(new Proton.PointZone(0, 0)));
				emitter.addInitialize(new Proton.Mass(1));
				emitter.addInitialize(new Proton.Radius(proton_settings.radius.x, proton_settings.radius.y));
				emitter.addInitialize(new Proton.Life(proton_settings.life));
				var imagedata = context.getImageData(rect.x, rect.y, rect.width, rect.height);
				emitter.addInitialize(new Proton.P(new Proton.ImageZone(imagedata, rect.x, rect.y + 50)));
				//addBehaviour

				randomBehaviour = new Proton.RandomDrift(1, 1, .2);
				gravity = new Proton.Gravity(0);
				emitter.addBehaviour(customScaleBehaviour());
				emitter.addBehaviour(gravity);
				emitter.addBehaviour(randomBehaviour);
				emitter.addBehaviour(new Proton.Color(['#00aeff', '#0fa954', '#54396e', '#e61d5f']));
				emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvas.width, canvas.height), 'collision'));
				emitter.emit();
				//add emitter
				proton.addEmitter(emitter);

				//canvas renderer
				renderer = new Proton.Renderer('canvas', proton, canvas);
				renderer.start();

				//debug
				//Proton.Debug.drawEmitter(proton, canvas, emitter);

				index = 0;
				window.addEventListener('mousedown', function(e) {
					index++;
					if (index % 3 == 1) {
						randomBehaviour.reset(2, 0, .2);
						gravity.reset(1.5);
					} else if (index % 3 == 2) {
						randomBehaviour.reset(50, 50, .1);
						gravity.reset(0);
					} else {
						randomBehaviour.reset(2, 2, .2);
						gravity.reset(0);
					}
				});
			}

			function customScaleBehaviour() {
				return {
					initialize : function(particle) {
						particle.oldRadius = particle.radius;
						particle.scale = 0;
					},
					applyBehaviour : function(particle) {
						if (particle.energy >= 2 / 3) {
							particle.scale = (1 - particle.energy) * 3;
						} else if (particle.energy <= 1 / 3) {
							particle.scale = particle.energy * 3;
						}
						particle.radius = particle.oldRadius * particle.scale;
					}
				}
			}

			function tick() {
				requestAnimationFrame(tick);
				proton.update();
			}