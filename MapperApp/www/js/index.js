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

// Instance variables, (or somthing close to that)
//var destinationType i used by the camera in order to take photos

var destinationType;

//this usert is used to identify the user of the application
var thisUser;
var app = {



  // Application Constructor
  //this is where i would add any event Listeners such as page load, pause, resume
  initialize: function()
  {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

    //The string denotes the event, the second parameter deffines what the acting function should be
    document.addEventListener('pause', this.onPause, false);

    document.addEventListener('resume',this.onResume,false);

    //this checks if the Pages have been loaded
    $(document).on("pageshow","#HomePage", this.onHomePageInit);
    $(document).on("pageshow","#PhotoPage", this.onPhotoPageInit);
    $(document).on("pageshow","#DataPage", this.onDataPageInit);
    $(document).on("pageshow","#EditPage", this.onDataPageInit);

    //this is goign to be a check when document is ready
    $(document).ready(function() { console.log('Ready');});

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
    //this is called hear because i need to be sure that there is a device that has a camera
    destinationType=navigator.camera.DestinationType;

    Backendless.enablePromises();
  },

  //This handles the pause event,
  onPause: function()
  {

  },

  onResume: function()
  {
    //this checks if the user has a login value, if not they are redirected to the home page so they can log in or register
    if(thisUser == null)
    {
        $.mobile.navigate("#HomePage");
    }
  },


  onHomePageInit: function()
  {
    //Sets up the camera button
    $('#cameraButton').on('click', function() {
    app.CapturePhoto();
    });

    //sets up the login and register buttons
    $('#loginButton').on('click', function(){
      //grabs the values for the username and password
      var uName = $('#Uemail').val();
      var uPass = $('#UPassword').val();

      //calls the login funciton
      app.userLogin(uName,uPass);
    });

    $('#registerButton').on('click', function(){
      //grabs the values for the username and password
      var uName = $('#Uemail').val();
      var uPass = $('#UPassword').val();

      //calls the register funciton
      app.userRegister(uName,uPass);
    });

  },

  onPhotoPageInit: function()
  {
    $('#cameraButton_p').on('click', function() {
    app.CapturePhoto();
    });

    //sets up the listener for the save button
    $('#SavePin').on('click', function(){
    app.onSavePin();
    });
  },

  onDataPageInit: function()
  {

    $('#cameraButton_d').on('click', function() {
    app.CapturePhoto();
    });

    app.dataPageLoader();
  },

  dataPageLoader: function()
  {
    //THis clears the dataList
    $('#dataList').empty();

    app.retriveData(app.processData);


    $('#dataList').listview('refresh');
  },

  editPageinit: function()
  {
    //sets up the camera button
    $('#cameraButton_e').on('click', function() {
    app.CapturePhoto();
    });
  },
  // Update DOM on a Received Event This function was created by cordova and not by me as where its calls
  receivedEvent: function(id)
  {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  },

  //this funciton is used to register users with the backendless
  userRegister: function(username, userpassword)
  {
    //this checks the values provided by the users
    if(username =="")
    {
      alert('Please enter a Email adress');
    }
    else if(userpassword == "")
    {
      alert('Please enter a Password');
    }
    else
    {
      //if both values are suatable the system attempts to register the userRegister
      //a user object is created
      var newUser = new Backendless.User();
      //values for email and password are created
      newUser.email = username;
      newUser.password = userpassword;
      newUser.userKey = app.fileNamer();

      //A backendless register attempt is now called
      Backendless.UserService.register(newUser).then(app.registerSuccess).catch(function(){
        //clears the password box
        $('#UPassword').val("");
        app.onFail();
      });
    }
  },

  //this method is called when
  registerSuccess: function(regedUser)
  {
    alert('Register sucesfful');
    app.userLogin(regedUser.email, regedUser.password);
  },
  //This function is used to log the users into the backendless
  userLogin: function(username, userpassword)
  {
    //this checks the values provided by the users
    if(username =="")
    {
      alert('Please enter a Email adress');
    }
    else if(userpassword == "")
    {
      alert('Please enter a Password');
    }
    else
    {
      //if both values are valid then a login is attempted
      //sedns in a username, a user password and states that the user should remain logged in
      Backendless.UserService.login(username, userpassword, true).then(app.loginSuccess).catch(function(){
        //clears the password box
        $('#UPassword').val("");
        app.onFail();
      });
    }
  },
//this function occurs when the user has sucesfully logged on
  loginSuccess: function(loggedUser)
  {
    alert('login successfull');

    //this sets the variable for this user to be the instance of the Backendless user object provided by the loggin attempt
    thisUser = loggedUser;
    //this calls the retrive data funciton and passes the loginDataCheck as a parameter to be called back asynchrounasly (cant spell)
    app.retriveData(app.loginDataCheck);


  },

  loginDataCheck: function(userData)
  {
    //this checks the size of their data folder, if it is empty the user is directed to take a photo, if not then they are led to the data view page
    //this therfore reacts to user data to personlize the user experince to the user
    if(userData.length > 0)
    {
      //navigates to the data view page
        $.mobile.navigate("#DataPage");
    }
    else
    {
      alert('attempting photo');
      //calls the capture photo method
      app.CapturePhoto();
    }
  },

  //This funciton is used to retrive data from the backendless data structure
  retriveData: function(callback)
  {
    if(thisUser != null)
    {
      //this creates a search claus that will esnure that only tyhe pins created by the user will be returned to them
      var searchClaus = "User = '"+thisUser.userKey+"'";
      var querryBuild =  Backendless.DataQueryBuilder.create().setWhereClause(searchClaus);

      //the app then retrives the data from Backendless
      var pinData;
      Backendless.Data.of("Pins").find(querryBuild).then(function(searchPin){
        pinData = searchPin;

        callback(pinData);
      }).catch(app.BackError);
    }
    else
    {
      //if there is no current user then an alert is displayed and the user is redirected tot he home page
      alert('Please log in or register')
      $.mobile.navigate("#HomePage");
      return null;
    }
  },

  //this fills the data view with the content found in the backendless pins table
  processData: function(tData)
  {
    for(var i=0; i < tData.length; i++)
    {
      //this creates list items with an image and a n onclick funciton that sends istelf to the imageSelect fucntion
      $('#dataList').append("<li>"+"<image style='display:block;width:300px;height:350px;' src='"+tData[i].Picture+"'onclick='app.imageSelect(this)'</li>");

    //this creaets a list item that holds the pin text created by the user
      $('#dataList').append("<li data-inline='true' >"+tData[i].Text+"</li>");
    }
    },

    //this funciton takes in a image elemtn and grabs its src and opens the edit page using the selected image
  imageSelect: function(pImage)
  {
       var imageSrc = $(pImage).attr('src');

      //this navigates to the edit page
      $.mobile.navigate("#EditPage");

      //this retrives the pin from backendless where the Pin picture is the same as as the selected image
      //cerates a querry string
      var querryString = "Picture = '"+imageSrc+"'";
      //create a querry builder
      var querryBuild = Backendless.DataQueryBuilder.create().setWhereClause(querryString);

      //retrives the pin
       Backendless.Data.of("Pins").find(querryBuild).then(function(foundPin){
         var selectPin = foundPin;
        //sets th image pin to the first value (the querry always returns an array but there is only one value)
        var imagePin = selectPin[0];

        //this finds the elemnt to hold the image and sets the image
        $('#selectedImage').attr('src',imagePin.Picture);

        //this finds the elemnt for the text and sets thepin text
        $('#selectedNote').attr('value',imagePin.Text);

        //this adds event listeners for the save cahnges and delete buttons
        $('#applyChange').on('click', function() {
        app.updatePin(imagePin,  $('#selectedNote').attr('value'));
        });
        $('#deletePin').on('click', function() {
        app.deletePin(imagePin);
        });

       });
    },

//the purpose of this funciton is to update pin data
    updatePin: function(overPin, newText)
    {
      //sets the pin text to the inputed text
      overPin.Text = newText;
        //the same call is used to save as to update as they have the same id so the data is updated
      //calls the storage to the Pins table
      Backendless.Data.of("Pins").save(overPin).then(app.onNoteSuccess).catch(app.BackError);
    },
  // Camera code
  //for the camera to work it need sto have a function for
  //capturing photos
  CapturePhoto: function()
  {
    //call the navigator.camera.getPicture(success, fail, camera/imagedata) funcction
    //This function calls the getpictur method of the camera, on a sucesfful capture the picture is sent to the photo screen, if a fail occurs a popup will appear
    navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, { quality: 50, destinationType: destinationType.DATA_URL});
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



    //this creates
    var photoData = document.getElementById('photoData');
    photoData.style.visibility="hidden";
    photoData.value =imageData;

    var inputButton = document.getElementById('SavePin');
    inputButton.disabled = false;
  },

  //unsucsesfull attempt
  onFail: function(message)
  {
    alert('Failed because : '+ message);
  },

  onNoteSuccess: function(savedNote)
  {
    alert('Saved Pin Data');
  },

  //Backendless note upload //FOR TESTING PURPOSES
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

  //this function saves a value to the table for the result.fileURL and the note
  UploadResult: function(result)
  {
    alert( "File successfully uploaded. Path to download: " + result.fileURL );
    var noteVal = $('#note').val();

      //creates the new pin to be stored and sets its values
      var newPin = {};
      newPin.Picture =result.fileURL;
      newPin.Text =noteVal;
      newPin.User = thisUser.userKey;

      //calls the storage to the Pins table
      Backendless.Data.of("Pins").save(newPin).then(app.onNoteSuccess).catch(app.BackError);

  },


  //This function is used to upload images to the backendless file service. Once the file is uploaded the file reference and pin are saved to a table
  onSavePin: function()
  {
    //Grabs the value of the note input box
    var noteVal = $('#note').val();
    //cheks if val is empty
    if(noteVal != "")
    {
      //this grabs the image data from the input  disabled element
      var photoData = document.getElementById('photoData');

      //this stores the imagedata
      var imageData = photoData.value;
      //THis converts the image data into a jpeg image
      var newPhoto = app.ConvertBase64toFile(imageData,"image/jpeg" );

      //this gives the new file a random name
      newPhoto.name = app.fileNamer();

      newPhoto.name += ".jpeg";
      //lets user know the upload is takign place
      alert('Attempt upload. Please be patient as the image uploads')
      try
      {
        //attempt the upload to the pinImages file
        Backendless.Files.upload( newPhoto, "PinImages").then(app.UploadResult).catch(app.BackError);
      }
      catch(error)
      {
        alert(error);
      }
    }
    else
    {
    //this causes an alert if there is no note
    alert('No Note');
    }
  },
  //THis function takes base 64 data wich is provided by bthe camera and converts it to a file which can be stored and uploaded to Backendless
  //The function takes in the image data which is the base64 data, and the format which de4fines what type of file is produced
  //The ideas that went into this code were heavily influenced by commenter Jürgen 'Kashban' Wahlmann on Stack overflow https://stackoverflow.com/questions/21227078/convert-base64-to-image-in-javascript-jquery
  ConvertBase64toFile: function(imageData, contentType)
  {
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


      //Array for holding all the UTF-16 codes for the current slice
      var currentBytes = new Array(endP - startP);
      for( var offset = startP, i =0; offset < endP; ++i, ++offset)
        {
        //converts to UTF-16
        currentBytes[i] = decodeChar[offset].charCodeAt(0);

        }
      //sets the image array at the slice index tro the data produced for current Bytes
      imageArray[sIndex] = new Uint8Array(currentBytes);
    }
    return new Blob(imageArray, {type: contentType});
  },

  //the purpose of this method is to give files unuiqe names
  fileNamer: function()
  {
    //declare a variable for the filename
    var fName = "";

    //declare a variable for a random ascii number
    var randAscii;

    for(var i =0; i< 10; i++)
    {
      //set the random number to a number between 97 and 122 rounded down as these are the ascii values for lower case letters
      randAscii = Math.floor((Math.random()*25)+97);
      fName += String.fromCharCode(randAscii);
    }

    return fName;
  },

//the function of this method is to delete pins found in the users library of pins
  deletePin: function(pinVal)
  {
    //this retrives the objectID

    //var imgPath = pinVal.Picture;


    //this calls for the image file to be removed form the database
    // Backendless.Files.remove(imgPath).then(function() {
    //
    // }).catch(app.BackError);

    //this calls the remove method of backendless to remove the pin
    Backendless.Data.of("Pins").remove(pinVal).then(function() {
      alert('Pin sucesfully deleted');

      //navigate to the data page  //navigaet to #Photopage
        $.mobile.navigate("#DataPage");
    }).catch(app.BackError);
  },

   BackError: function(err)
   {
      console.log("error message - " + err.message);
      console.log("error code - " + err.statusCode);
  },
};
app.initialize();
