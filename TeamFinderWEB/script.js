// check if even
function isEven(value) {
    if (value % 2 == 0)
        return true;
    else
        return false;
}

//combination function
function combinationsAV2(n, k) {
    var result = [];
    var combos = [];

    const recurse = start => {
        if (combos.length + (n - start + 1) < k) { return }
        recurse(start + 1);
        combos.push(start);
        if (combos.length === k) {
            result.push(combos.slice());
        } else if (combos.length + (n - start + 2) >= k) {
            recurse(start + 1);
        }
        combos.pop();
    }
    recurse(1, combos);
    return result;
}
function sum(input) {

    if (toString.call(input) !== "[object Array]")
        return false;

    var total = 0;
    for (var i = 0; i < input.length; i++) {
        if (isNaN(input[i])) {
            continue;
        }
        total += Number(input[i]);
    }
    return total;
}

// function that actually finds teams
function findTeams(playingPlayers) {

    var playerNames = playingPlayers.names;
    var playerValues = playingPlayers.values;
    var playersSelected = playerValues.length;
    var playersPerTeam = playerNames.length / 2;

    // main starts here
    var c = combinationsAV2(playersSelected, playersPerTeam);
    // This outputs an array of array that need to be splitted first-last, second-secondlast etc

    var whiteTeam = [];
    var blackTeam = [];

    for (i = 0; i < c.length / 2; i++) {
        whiteTeam.push(c[i]);
        blackTeam.push(c[c.length - i - 1]);
    }

    // Only keep those who are balanced
    var desiredTeamValue = sum(playerValues) / 2;
    var whiteTeamNew = [];
    var blackTeamNew = [];
    var summation = 0;
    var increment;

    for (i = 0; i < whiteTeam.length; i++) {
        for (j = 0; j < whiteTeam[i].length; j++) {
            increment = playerValues[whiteTeam[i][j] - 1];
            summation = summation + increment;
        }

        // if the sum of values in team is not good, delete team from array
        if (summation == desiredTeamValue) {
            whiteTeamNew.push(whiteTeam[i]);
            blackTeamNew.push(blackTeam[i]);
        }
        summation = 0; // reset sum as last thing
    }
    // check that teams array are not empty here and have at least 1 possible team, otherwise notify and abort  
    if ((Array.isArray(whiteTeamNew) && whiteTeamNew.length)) {
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
            string1 = string1 + playingPlayers.names[whiteTeam[strUser][j] - 1] + ", ";
            string2 = string2 + playingPlayers.names[blackTeam[strUser][j] - 1] + ", ";
        } else if (j < whiteTeam[strUser].length) {
            string1 = string1 + playingPlayers.names[whiteTeam[strUser][j] - 1];
            string2 = string2 + playingPlayers.names[blackTeam[strUser][j] - 1];
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
    playingPlayers = { names: [], values: [] };
    for (var i = 0; i < lgh; i++) {
        var string = "playersCheckbox" + i;
        if (document.getElementById(string).checked) {
            playingPlayers.names.push(players.names[i]);
            playingPlayers.values.push(players.values[i]);
        }
    }

    //Check that playingPlayers is Even number (can I make it work with odd numbers too?)
    if (!isEven(playingPlayers.names.length) || playingPlayers.names.length == 0) {
        alert("Please select an even number of players!");
        return 0;
    }
    else {
        var combinationOutput = findTeams(playingPlayers);
        whiteTeam = combinationOutput.whiteTeam;
        blackTeam = combinationOutput.blackTeam;

        //TODO print 1st team even without the displayTeam button being pressed
        var randTeam = Math.floor(Math.random() * whiteTeam.length);
        // set dropbox to random value and displayTeams()
        document.getElementById('outcomeDropdown').value = randTeam;
        displayTeam();
    }

}

function onClickRefreshPlayersListButton() {
    document.getElementById('playersList').innerHTML = "";
    document.getElementById('playersList').appendChild(makeCheckboxList(players.names));
}

function addPlayerToList() {
    // get inputs
    var inputName = document.getElementById('newPlayerNameField').value;
    var inputValue = document.getElementById('newPlayerValueField').value;
    // check if inputs make sense
    if ((!inputName) || (!inputValue)) {
        alert('First insert name and value!');
        return 0;
    }
    if (parseInt(inputValue) < 0 || parseInt(inputValue) > 5) {
        alert('Value should be integer between 0 and 5');
        return 0;
    }
    // append to players object
    players.names.push(inputName);
    players.values.push(parseInt(inputValue));
    // refresh displayed list
    onClickRefreshPlayersListButton();
}

function deletePlayerFromList() {
    for (var i = 0; i < players.names.length; i++) {
        var string = "playersCheckbox" + i;
        if (document.getElementById(string).checked) {
            players.names[i] = "toDelete10297465";
            //players.values[i] = "toDelete";
        }
    }

    // create new player object without the deleted ones, then overrite it
    var newplayers = { names: [], values: [] };
    for (var i = 0; i < players.names.length; i++) {
        if (players.names[i] != "toDelete10297465") {
            newplayers.names.push(players.names[i]);
            newplayers.values.push(players.values[i]);
        }
    }

    //overrite players with newplayers
    players = newplayers;
    
    //refresh list
    onClickRefreshPlayersListButton();
}

// WATCH OUT FOR THAT TXT CONTENT, I THINK IT'S ONLY WORKING NOW BECAUSE IT ONLY EVER GETS CALLED WITHIN THE READBLOB FUNCTION!
function loadDatabase() {
    // overwrite players array
    players.names = [];
    players.values = [];

    var myArray = txtContent.split('\n');
    var myArray2 = [];

    for (i = 0; i < myArray.length; i++) {
        myArray2.push(myArray[i].split(/([0-9]+)/));
    }

    for (i = 0; i < myArray2.length; i++) {
        if (myArray2[i][0] || parseInt(myArray2[i][1])) { // gets rid of empty/spurious elements
            players.names.push(myArray2[i][0]);
            players.values.push(parseInt(myArray2[i][1]));
        }
    }
    // refresh players list
    onClickRefreshPlayersListButton();
}

function saveDatabase() {
    var wholetext = '';
    var newtext = '';
    // create big string via iteration
    for (var i = 0; i < players.names.length; i++) {
        newtext = [players.names[i] + players.values[i] + '\n'];
        wholetext = wholetext.concat(newtext);
    }


    var blob = new Blob([wholetext],
        { type: "text/plain;charset=utf-8" });
    saveAs(blob, "myFirstPlayersList.txt");
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
        loadDatabase();
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

        //TODO need to perform some checks here to avoid users inputing just anything
        readBlob(startByte, endByte);
    }
}, false);

//main
var players = {
    names: ["Joe Blogg ", "Jean Dupont ", "Erika Mustermann ", "Mario Rossi ", "Ivan Horvat ", "Petras Petraitis ", "Juan Pérez ", "Ion Popescu ", "John Smith ", "Jan Modaal "],
    values: [1, 2, 3, 4, 5, 2, 4, 1, 3, 5]
};
var whiteteam = [];
var blackTeam = [];
var playingPlayers = { names: [], values: [] };
var txtContent;

var isMobile = false; //initiate as false
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
    isMobile = true;
}

//if on desktop, display pre-made list, if on mobile don't display it and delete it instead
if (!isMobile) {
    onClickRefreshPlayersListButton();
} else {
    var players = { names: [], values: [] };
}