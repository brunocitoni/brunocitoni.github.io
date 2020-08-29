var players = {names : ["graeme", "abed", "bruno", "yingke","KC", "unkown 1", "henrik", "unknown 2", "unknown 3","unknown 4"] , values : [4, 4, 2, 1, 3, 3, 4, 3, 3, 3]};



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


function playerFormOnClick(){
     document.getElementById("myForm").submit();
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

        out = {whiteTeam,blackTeam};
        return out;
    }
    else {
        window.alert("No Teams Found!");
        // TODO abort i na better way that this!
        return 0;
    }
 
    
}


//main
var whiteteam = [];
var blackTeam =[];

var combinationOutput = findTeams(players);

whiteTeam = combinationOutput.whiteTeam;
blackTeam = combinationOutput.blackTeam;

// populate dropdown
var select = document.getElementById("outcomeDropdown"); 
var options = whiteTeam; 
select.innerHTML = ""; //clear dropdown first
for(var i = 0; i < options.length; i++) {
    var opt = options[i];

    var el = document.createElement("option");
    el.text = i+1;
    el.value = i; // so that you don't have to -1 to use this as index

    select.add(el);
}

function displayTeam(){
    // pick which team to show
    var string1 = "";
    var string2 = "";

    var e = document.getElementById("outcomeDropdown");
    var strUser = e.options[e.selectedIndex].value;


    for (j=0; j < whiteTeam[strUser].length; j++){
        if (j<whiteTeam[strUser].length-1)
        {
            string1 = string1 + players.names[whiteTeam[strUser][j]-1] + ", ";
            string2 = string2 + players.names[blackTeam[strUser][j]-1] + ", ";
        } else if (j<whiteTeam[strUser].length)
        {
            string1 = string1 + players.names[whiteTeam[strUser][j]-1]+ ". ";
            string2 = string2 + players.names[blackTeam[strUser][j]-1] + ". ";
        }
        }

        // TODO FIX THIS (currently it only prints last one found)
        document.getElementById("whiteTeam").innerHTML = string1;
        document.getElementById("blackTeam").innerHTML = string2;
}



//document.getElementById("demo").innerHTML = desiredTeamValue;

//document.getElementById("demo").innerHTML = whiteTeam + " VS " + blackTeam;

