(function() {
    
    // Need for audio stream
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia); 
    // Audio context
    var myAudioContext;

    // Output buffer
    var playBuffer;
    
    // Gain nodes
    var dry;
    var wet;
    var finalGain;
    
    // Convolver node
    var convolver;
    
    // Microphone stream buffer
    var realTimeStream;
      
    // Input boxes
    var sourceBox;
    var receiverBox;
    
    // Source & IR buffers
    var drySampleBuffer = null; 
    var impulseResponseBuffer = null;
    
    // Source & IR urls
    var drySampleUrl;
    var impulseResponseUrl;
    
    // Wet-Dry weighting
    var wetDryMix;
    
    // Input checkbox
    var realTimeInput;

    // Flags
    var micSetFlag = 0;
    var playingFlag = 0;
    var sceneCreated = 0;
    var firstTimeFlag = 0;
    
    
// Main
function auraliser() {   
    
        // Create an audio context.  
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        myAudioContext = new window.AudioContext();
            
        // Set up Web Audio elements
        convolver = myAudioContext.createConvolver();
        dry = myAudioContext.createGain();
        wet = myAudioContext.createGain();
        finalGain = myAudioContext.createGain();
        finalGain.gain.value = 0.8;
    
        // Request access to microphone
        initMic();
        
        // Set visibility of canvases
        initCanvasesVisibility();
        
        // Set up HTML elements
        var playButton = document.getElementById("playConv");
        var stopButton = document.getElementById("stopConv");
        realTimeInput = document.getElementById("userInput");
        wetDryMix = document.getElementById("wetDryMix");
        receiverBox = document.getElementById("receiverChoice");
        sourceBox = document.getElementById("sourceChoice");
    
        // Set up event listeners
        playButton.addEventListener("click", play);
        stopButton.addEventListener("click", stop);
        realTimeInput.addEventListener("click", realTime);
        wetDryMix.addEventListener("change", getMix);
        sourceBox.addEventListener("change", fetchSourceUrl);
        receiverBox.addEventListener("change",fetchImpulseResponseUrl);

        }



// Play button
function play() {
        
         // Stop playing previous sample, if anything is playing
         //stop();
         
         // Get Dry-Wet mix before playing
         getMix();
    
         // Clear buffers
         //clearBuffers();
        
         //Set up appropriate picture
         setupPicture();
    
         // Set up convolver
         setupConvolver();
    
         // Load source & send PLAY request
         loadSource();
         
         // So that one has to Stop current convolution before starting a new one
         hide("playConv");
         unhide("stopConv");

}
    
// Stop Button 
function stop() {
        
        // So Stop cannot be pressed unless something is being played 
        unhide("playConv");
        hide("stopConv");
    
        // Stop output buffer
        playBuffer.stop(0);
        
        // Clear the buffers (Needed?)
        clearBuffers();
        
        // Swap canvases BEFORE RESETTING FLAG TO 0!
        swapCanvases();
        
        // Set Flag to 0
        playingFlag = 0;
    
        // Turn off gain to cut reverb tail
        finalGain.gain.value = 0.0;

}
    
    
// Set samples             
function loadSource() {
    
    // Retrieve source audio
    fetchSourceUrl();
    
    // Create request to decode source and play it
    var request = new XMLHttpRequest(); 
    
    request.open('GET', drySampleUrl, true);
    request.responseType = 'arraybuffer';
    
    //Decode asynchronously
    request.onload = function() {
    myAudioContext.decodeAudioData(request.response, function(buffer) {
    drySampleBuffer = buffer;

    playSound();
    
    }, function(error) {
            console.error("decodeAudioDataSource error", error);
        });
    };
    
    request.send();
    }

function setupConvolver() {
    
    // Retrive IR
    fetchImpulseResponseUrl();
    
    // Decode IR and set convolver buffer
    var request = new XMLHttpRequest();
    request.open('GET', impulseResponseUrl, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {

    myAudioContext.decodeAudioData(request.response, function(buffer) {
    impulseResponseBuffer = buffer;
    convolver.buffer = impulseResponseBuffer;
    
    }, function(error) {
            console.error("decodeAudioDataConvolver error", error);
        });
    };
    request.send();
    
}

function playSound() {
    
    // Create output buffer and set dry signal to input
    playBuffer = myAudioContext.createBufferSource();    
    playBuffer.buffer = drySampleBuffer;

    // Send dry input to both convolver and dry gain
    playBuffer.connect(convolver);
    playBuffer.connect(dry);
    
    // Send only convolver output to wet gain
    convolver.connect(wet); 
    
    // Send wet and dry to final gain
    wet.connect(finalGain);
    dry.connect(finalGain); 
    
    // Connect final gain to output
    finalGain.gain.value = 0.8;
    finalGain.connect(myAudioContext.destination);
    
    // Play sound after 0sec
    playBuffer.start(0);
    
    // Set flag to 1 = something is being played
    playingFlag = 1;
    
    // When sound ends
    playBuffer.onended = function() {
        stop();
    };
}    
    
    
// Real-Time 
function realTime() {
    
    // Don't give the permission to use real time input until permission is given
    if (firstTimeFlag === 0)
    {
        window.alert("Give permission first! (or not)");
        realTimeInput.checked = false;
    }
    
    else   // If permission is given
    
    {
        if (firstTimeFlag == 1)
        {
            // Stop playing previous sample, if anything is playing
            if (playingFlag == 1)
            stop();
            
            // Set gain high again after having stopped and turned it down
            finalGain.gain.value = 0.8;
        }
    
    // Get wet-dry mix and set up picture
    getMix();
    setupPicture();
        
    // Set up convolver node for real time
    realTimeConvolverSetup();

    // Connect nodes 
    connectMicStream(); 
    
    }
    
}    
      
function realTimeConvolverSetup() {
    
    // Fetch choice
    fetchImpulseResponseUrl();
    
    // Request 
    realTimeConvolverRequest();
    
}  
   
function realTimeConvolverRequest() {
    
    // Decode IR and set it to convolver 
    var request = new XMLHttpRequest();
    request.open('GET', impulseResponseUrl, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {

    myAudioContext.decodeAudioData(request.response, function(buffer) {
    impulseResponseBuffer = buffer;
    convolver.buffer = impulseResponseBuffer;
    
    
    }, function(error) {
            console.error("decodeAudioDataConvolver error", error);
        });
    };
    request.send();
}  
    
    
// Misc 
function clearBuffers() {
    drySampleBuffer = null;
    impulseResponseBuffer = null;
    playBuffer = null;
}      
       
    
// Event functions
function fetchSourceUrl() {
    // Retrieve drt sample
    var source = sourceBox.options[sourceBox.selectedIndex].id;
    drySampleUrl = "sounds/" + source + ".wav";
}
    
function fetchImpulseResponseUrl () {
    
    // Retrieve IR
    var receiver = receiverBox.options[receiverBox.selectedIndex].id;
    impulseResponseUrl = "sounds/" + receiver + ".wav";
    
   // When in real-time
   if (realTimeInput.checked === true)
    {
        // Listen for changes and update picture and IR as soon as change happen
        setupPicture();
        realTimeConvolverRequest();
    }
 
}
        
function getMix() {    
    
  // Get dry and wet values    
  var value = wetDryMix.value / 100.0;
  dry.gain.value = (1.0 - value);
  wet.gain.value = value;
}
    

    
    
// Mic methods 
function initMic() {
    
    //Set up stream
    
    if (navigator.getUserMedia) {
    
    navigator.getUserMedia (
      {          
         audio: true    // Asks for permission to use microphone
      },

       
      // If permission is given
      function(stream) {
        
          //Set up real time buffer
          realTimeStream = myAudioContext.createMediaStreamSource(stream);
         
          // Set to 1 when permission is given
          firstTimeFlag = 1;
          
          // If for some reason is hidden
          unhide("userInputDiv");
          
      },

      // If permision is not given
      function(err) {
         console.log('The following gUM error occured: ' + err);
          
          // Set to 1 if permission is not given 
          firstTimeFlag = 1;
          
          // Hide real time checkbox
          hide("userInputDiv");
      }
   );}
        // If not supported
        else {
          window.alert('getUserMedia not supported on your browser! Please use Google Chrome for full functionality!');
          //set to 1 if permission is not given 
          firstTimeFlag = 1;
          
          //Hide real time checkbox
          hide("userInputDiv");
        } 
    
    }
      
function connectMicStream() {
                        
          //HIDE UI
          hide("sourceChoiceDiv");
          hide("sourceChoice");
          hide("startAndStopButtons");
          hide("playConv");
          hide("stopConv");
          hide("userInputDiv");
    
          // Unhide reset button
          unhide("resetDiv");
          
          //Connect nodes 
          realTimeStream.connect(dry);
          realTimeStream.connect(convolver);
            
          convolver.connect(wet);
            
          wet.connect(finalGain);
          dry.connect(finalGain);
          
          finalGain.gain.value = 0.8;
          finalGain.connect(myAudioContext.destination);
          
}
    

//Animation methods (http://threejs.org)
function setupPicture() {
 
		    // Scrolling flag
			var manualControl = false;
			
            // Set coordinates for scrolling picture
            var longitude = 0;
			var latitude = 0;
			var savedX;
			var savedY;
			var savedLongitude;
			var savedLatitude;
    
            var receiver = receiverBox.options[receiverBox.selectedIndex].id;
            
            // Make sure tight canvas is displayed
            swapCanvases();
            
            var container = document.getElementById("movingPic");  
            
            // Only creates one renderer at any one time
            if (sceneCreated === 0) {  
            renderer = new THREE.WebGLRenderer();
            
			renderer.setSize(container.offsetWidth, container.offsetHeight);
			container.appendChild(renderer.domElement);
            
            sceneCreated = 1;
            }
            
            // Create a scene
			var scene = new THREE.Scene(); 
                
            // Create a camera    
            var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
			camera.target = new THREE.Vector3(0, 0, 0);
                
            // Create a cube geometry
            var box = new THREE.BoxGeometry(30,30,30);
            box.applyMatrix(new THREE.Matrix4().makeScale(-1,1,1));
    
            // Collect textures for interior cube geometry
            var boxMaterial = [
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture("pix/" + receiver + "back.jpg")
       }),
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture("pix/" + receiver + "front.jpg")
       }),
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture("pix/" + receiver + "up.jpg")
       }),
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture("pix/" + receiver + "down.jpg")
       }),
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture("pix/" + receiver + "right.jpg")
       }),
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture("pix/" + receiver + "left.jpg")
       })
    ];
            
            // Paint cube geometry and add it to the scene
            var boxMesh = new THREE.Mesh(box, new THREE.MeshFaceMaterial(boxMaterial));
            scene.add(boxMesh);


			// Set up listeners
			container.addEventListener("mousedown", onDocumentMouseDown, false);
			container.addEventListener("mousemove", onDocumentMouseMove, false);
			container.addEventListener("mouseup", onDocumentMouseUp, false);
				
            render();
               
            function render(){
				
				requestAnimationFrame(render);

				// Limiting latitude
                latitude = Math.max(-85, Math.min(85, latitude));

				// Moving the camera
				camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.cos(THREE.Math.degToRad(longitude));
				camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - latitude));
				camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.sin(THREE.Math.degToRad(longitude));
				camera.lookAt(camera.target);

				// Calling again render function
				renderer.render(scene, camera);	
			}
			
			// When the mouse is pressed save current coordinates
			function onDocumentMouseDown(event){

				event.preventDefault();

				manualControl = true;

				savedX = event.clientX;
				savedY = event.clientY;

				savedLongitude = longitude;
				savedLatitude = latitude;

			}

			// When the mouse moves we adjust coordinates
			function onDocumentMouseMove(event){

				if(manualControl){
					longitude = (savedX - event.clientX) * 0.1 + savedLongitude;
					latitude = (event.clientY - savedY) * 0.1 + savedLatitude;
                }

			}

			// When the mouse is released, we turn manual control flag off
			function onDocumentMouseUp(event){ 

				manualControl = false;

			}
            
    
}    

function swapCanvases(){
  
  // Get html elements
  var static = document.getElementById("staticPic");
  var moving = document.getElementById("movingPic");
    
  // MASTER OF LOGIC!
  // Switch between static and scollable pictures 
  if ((playingFlag === 0 && static.style.visibility == 'visible') || realTimeInput.checked === true){
      
    static.style.visibility='hidden';
    moving.style.visibility='visible';
  }
  else{
    
    static.style.visibility='visible';
    moving.style.visibility='hidden';
  }
}
    
function initCanvasesVisibility () {
    
    //Initialise canvases
    var static = document.getElementById("staticPic");
    var moving = document.getElementById("movingPic");
    
    static.style.visibility='visible';
    moving.style.visibility='hidden';

    
} 

    
// UI functions 
function hide(ID) {
    document.getElementById(ID).className = 'hidden';
}
    
function unhide(ID) {
    document.getElementById(ID).className = 'unhidden';
}

    
// Export Auraliser.
auraliser();

}());
