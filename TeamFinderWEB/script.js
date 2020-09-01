function combinationsAV2(n, k) {
  var result= [];
  var combos = [];
    
  const recurse = start => {
    if (combos.length + (n - start + 1) < k) { return }
    recurse(start + 1);
    combos.push(start);
    if(combos.length === k) {     
       result.push(combos.slice());
    }else if(combos.length + (n - start + 2) >= k){
       recurse(start + 1);
    }
    combos.pop();
  }
  recurse(1, combos);
  return result;
}

function sum(input){
             
 if (toString.call(input) !== "[object Array]")
    return false;
      
            var total =  0;
            for(var i=0;i<input.length;i++)
              {                  
                if(isNaN(input[i])){
                continue;
                 }
                  total += Number(input[i]);
               }
             return total;
}

function findTeams(players){
    
    var playerNames = players.names;
    var playerValues = players.values;
    var playersSelected = playerValues.length;
    var playersPerTeam = playerNames.length/2;
    
    // main starts here
    var c = combinationsAV2(playersSelected,playersPerTeam); 
    // This outputs an array of array that need to be splitted first-last, second-secondlast etc

    var whiteTeam=[];
    var blackTeam=[];

    for (i = 0; i < c.length/2; i++) {
      whiteTeam.push(c[i]);
      blackTeam.push(c[c.length-i-1]);
    }

    // Only keep those who are balanced
    var desiredTeamValue = sum(playerValues)/2;
    var whiteTeamNew=[];
    var blackTeamNew=[];
    var summation = 0;
    var increment;

    for (i = 0; i < whiteTeam.length; i++){
        for (j=0; j < whiteTeam[i].length; j++){
            increment = playerValues[whiteTeam[i][j]-1];
            summation = summation + increment;
        }

        // if the sum of values in team is not good, delete team from array
        if (summation == desiredTeamValue){
            whiteTeamNew.push(whiteTeam[i]);
            blackTeamNew.push(blackTeam[i]);
        }
        summation = 0; // reset sum as last thing
    }
    // check that teams array are not empty here and have at least 1 possible team, otherwise notify and abort  
    if ((Array.isArray(whiteTeamNew) && whiteTeamNew.length))
    {
    // switch back to using the normal arrays for simplicity
        whiteTeam = whiteTeamNew;
        blackTeam = blackTeamNew;

        out = { whiteTeam, blackTeam };
        populateDropdown("outcomeDropdown", whiteTeam);
        return out;
    }
    else {
        window.alert("No Teams Found!");
        // TODO abort i na better way that this!
        return 0;
    }

 
}

function populateDropdown(id, list) {
    // populate dropdown
    var select = document.getElementById(id);
    var options = list;
    select.innerHTML = ""; //clear dropdown first
    for (var i = 0; i < options.length; i++) {
        var opt = options[i];

        var el = document.createElement("option");
        el.text = i + 1;
        el.value = i; // so that you don't have to -1 to use this as index

        select.add(el);
    }
}

function displayTeam() {
    // pick which team to show
    var string1 = "";
    var string2 = "";

    var e = document.getElementById("outcomeDropdown");
    var strUser = e.options[e.selectedIndex].value;


    for (j = 0; j < whiteTeam[strUser].length; j++) {
        if (j < whiteTeam[strUser].length - 1) {
            string1 = string1 + players.names[whiteTeam[strUser][j] - 1] + ", ";
            string2 = string2 + players.names[blackTeam[strUser][j] - 1] + ", ";
        } else if (j < whiteTeam[strUser].length) {
            string1 = string1 + players.names[whiteTeam[strUser][j] - 1];
            string2 = string2 + players.names[blackTeam[strUser][j] - 1];
        }
    }
    document.getElementById("whiteTeam").innerHTML = string1;
    document.getElementById("VS").innerHTML = "VS";
    document.getElementById("blackTeam").innerHTML = string2;
}

function makeCheckboxList(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        var string = "playersCheckbox" + i;
        checkbox.id = string;

        // Set its contents:document 
        item.appendChild(document.createTextNode(array[i]));
        item.appendChild(checkbox);
        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

function onClickFindTeamButton() {

    var lgh = players.names.length;
    var playingPlayers = { names: [], values: [] };
    for (var i = 0; i < lgh; i++) {
        var string = "playersCheckbox" + i;
        if (document.getElementById(string).checked) {
            playingPlayers.names.push(players.names[i]);
            playingPlayers.values.push(players.values[i]);
        }
    }

    var combinationOutput = findTeams(playingPlayers);
    whiteTeam = combinationOutput.whiteTeam;
    blackTeam = combinationOutput.blackTeam;

    //TODO print 1st team even without the displayTeam button being pressed
}

function onClickRefreshPlayersListButton() {
    document.getElementById('foo').innerHTML = "";
    document.getElementById('foo').appendChild(makeCheckboxList(players.names));
}

// straight outta internet
function readBlob(opt_startByte, opt_stopByte) {

    var files = document.getElementById('fileInput').files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    var doSomeStuff = function () {
        // parse and uverride players list 
       // console.log("The text content was " + txtContent);

        var myArray = txtContent.split('\n');
        var myArray2 = [];

        for (i = 0; i < myArray.length; i++) {
            myArray2.push(myArray[i].split(/([0-9]+)/));
        }


        for (i = 0; i < myArray2.length; i++) {
            players.names.push(myArray2[i][0]);
            players.values.push(parseInt(myArray2[i][1]));
        }
        // refresh players list
        onClickRefreshPlayersListButton();
    };


    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function (evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            txtContent = evt.target.result;
            doSomeStuff();
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}
document.querySelector('.readBytesButtons').addEventListener('click', function (evt) {
    if (evt.target.tagName.toLowerCase() == 'button') {
        var startByte = evt.target.getAttribute('data-startbyte');
        var endByte = evt.target.getAttribute('data-endbyte');
        readBlob(startByte, endByte);
    }
}, false);

//main
var players = { names: [], values: [] };
var whiteteam = [];
var blackTeam = [];
var txtContent;
// read text file

// parse
//alert(txtContent);


// Add the contents of players to #foo:
//document.getElementById('foo').appendChild(makeCheckboxList(players.names));
