/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//This sets up the link between this app and the Backendless service
 Backendless.initApp("F86D06DB-CEBE-B738-FFD8-98DAB1FE7700","D45A8B4C-07FA-2B1F-FF9B-7835D4F8E900");

 var destinationType;
 var app = {

    // Instance variables, (or somthing close to that)
    //var destinationType i used by the camera in order to take photos

    // Application Constructor
    //this is where i would add any event Listeners such as page load, pause, resume
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        //The string denotes the event, the second parameter deffines what the acting function should be
        document.addEventListener('pause', this.onPause, false);

        document.addEventListener('resume',this.onResume,false);

        //this checks if the home Page has been loaded
         $(document).on("pagecreate","#HomePage", this.onHomePageInit);
         $(document).on("pagecreate","#PhotoPage", this.onPhotoPageInit);
         $(document).on("pagecreate","#DataPage", this.onDataPageInit);

         //this is goign to be a check when document is ready
         $(document).ready(function() { console.log('Ready');});


         //NOT MINE DELETE AFTER use
         document.getElementById('files').addEventListener('change', app.handleFileSelect, false);
    },



    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function()
    {
      //This calls the recived event method and sends the event through
      this.receivedEvent('deviceready');

      //This sets up the camera
      //this is called hear because i ned to be sure that there is a device that has a camera
      destinationType=navigator.camera.DestinationType;


    },

    //This handles the pause event,
    onPause: function()
    {
      //This calls the recived event method and sends the event through
      this.receivedEvent('pause');
    },

    onResume: function()
    {

    },


    onHomePageInit: function()
    {

      $('#cameraButton').on('click', function() {
      app.CapturePhoto();
      });

      $('#SaveFile').on('click', function(){
        app.UploadFile();
      });


    },

    processData: function(tData)
    {
      for(var i=0; i < tData.length; i++)
      {
        $('#dataList').append("<li>"+tData[i].TestString+"</li>");
      }
    },

    onPhotoPageInit: function()
    {
      $('#cameraButton_p').on('click', function() {
      app.CapturePhoto();
      });

      //sets up the listener for the save button
      $('#SaveNote').on('click', function(){
        app.onNote();
      });

    },

    onDataPageInit: function()
    {

      $('#cameraButton_d').on('click', function() {
      app.CapturePhoto();
      });

      //THis clears the dataList
      $('#dataList').empty();

      //this calls the backendless table call
      Backendless.Data.of("TestData").find().then(app.processData).catch(app.onFail);

      $('#dataList').listview('refresh');
    },


    // Update DOM on a Received Event
    receivedEvent: function(id)
    {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    // Camera code
    //for the camera to work it need sto have a function for
    //capturing photos
    CapturePhoto: function()
    {
      //call the navigator.camera.getPicture(success, fail, camera/imagedata) funcction
      //This function calls the getpictur method of the camera, on a sucesfful capture the picture is sent to the photo screen, if a fail occurs a popup will appear
      navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, { quality: 100, destinationType: destinationType.DATA_URL});
    },
    //Sucessfull attempt
    onPhotoDataSuccess: function(imageData)
    {
      //navigaet to #Photopage
      $.mobile.navigate("#PhotoPage");

      //have a object on the screen to hold the image
      //display the image
      var photoView =  document.getElementById('userPhoto');
      photoView.style.display = 'block';
      photoView.src ="data:image/jpeg;base64," + imageData;

      var newFile = app.ConvertBase64toFile(imageData,"image/jpeg" );


    },
    //unsucsesfull attempt
    onFail: function(message)
    {
      alert('Failed because : '+ message);
    },

    onNoteSuccess: function(savedNote)
    {
      alert('Saved new note '+ savedNote);
    },

    //Backendless note upload
    onNote: function()
    {
          //Grabs the value of the note input box
      var noteVal = $('#note').val();

      //cheks if val is empty
      if(noteVal != "")
      {
        //creates a new object to stor the note text
        var newNote ={};
        newNote.TestString = noteVal;

        //this calls the upload of the data to the backendless table
        Backendless.Data.of("TestData").save(newNote).then(app.onNoteSuccess).catch(app.onFail);
      }
      else
      {
        alert('No Note');
      }

    },

     handleFileSelect: function(evt)
    {
      alert('file Changed');
      files = evt.target.files[0]; // FileList object
    },

    //This method is used to upload a file
    UploadFile: function()
    {
    Backendless.Files.upload( files, "TestFiles").then(app.UploadResult).catch(app.onFail);
    },

    UploadResult: function(result)
    {
      alert( "File successfully uploaded. Path to download: " + result.fileURL );
    },

    //THis function takes base 64 data wich is provided by bthe camera and converts it to a file which can be stored and uploaded to Backendless
    //The function takes in the image data which is the base64 data, and the format which de4fines what type of file is produced
    //The ideas that went into this code were heavily influenced by commenter Jürgen 'Kashban' Wahlmann on Stack overflow https://stackoverflow.com/questions/21227078/convert-base64-to-image-in-javascript-jquery
    ConvertBase64toFile: function(imageData, contentType)
    {
      alert("Converting File")
        contentType = contentType || '';
      //declare a variable for the slice size of the portion of data being worked on, this is to prevent the system form havign to deal with too much information at once, preventing a Out of memmory error
      var sliceSize = 1024;
      //this decodes the image data, this allows it to be processed into a file
      var decodeChar = atob(imageData);
      //this holds the leng of decodeChar
      var CharLength = decodeChar.length;
      //This calculates how many slices the data needs to be portioned into and returns an int for this value using the celing function
      var sliceCount = Math.ceil(CharLength/sliceSize);
      //this creates an array of lenght sliceCount
      var imageArray = new Array(sliceCount);

      //THis for loop cycles through each slice and converts each character to a UTF-16 code using the charcCodeAt function
      for(var sIndex = 0; sIndex < sliceCount; ++sIndex)
      {
        //varianle for the start point of the slice
        var startP = sIndex * sliceSize;
        //var for the end point in the slice (either the end of the data or at startpoint + slice size, whichever is smaller)
        var endP = Math.min(startP+ sliceSize, CharLength);

        alert("For loop "+ sIndex);
        //Array for holding all the UTF-16 codes for the current slice
        var currentBytes = new Array(endP - startP);
        for( var offset = startP, i =0; offset < endP; ++i, ++offset)
        {
          alert("For loop "+ i);
          //converts to UTF-16
          try{
            currentBytes[i] = decodeChar[offset].charCodeAt(0);
          }
          catch(error)
          {
              alert(error);
          }


        }

        //sets the image array at the slice index tro the data produced for current Bytes
        imageArray[sIndex] = new Unit8Array(currentBytes);
        alert("Convert complete");
      }
      return new Blob(imageArray, {type: contentType});
    },

};
app.initialize();
