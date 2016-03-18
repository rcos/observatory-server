// This file is to help migrate the old database which had users with an 'attendance' field
// to a new attendance collection

// Standardize date to midnight
function standardDate(d){
    var date = new Date(d);
    date.setHours(0,0,0,0);
    return date;
}
function sameDate(one,two){
    return standardDate(one).getTime() == standardDate(two).getTime();
}


var smallgroups = db.smallgroups.find({});
// Remove the "semester" string in all the small groups and replace
// with the correct "classyear" id
while(smallgroups.hasNext()) {
    smallgroups.forEach(function(group){
        if (group.semester){
            var classyear = db.classyears.findOne({semester:group.semester})
            db.smallgroups.update(
                { "_id": group._id },
                {
                    $set: { "classYear": classyear._id },
                    $unset: { semester: 1 }
                }
            );
        }
    })

}

var users = db.users.find({});
var classyear = db.classyears.findOne({current:true});

while(users.hasNext()){
    //Get all the users
    users.forEach(function(user){
        var attendance = user.attendance;
        var unverifiedAttendance = user.unverifiedAttendance;
        var smallgroup = false;
        //Get the user's small group
        if (user.smallgroup){
            smallgroup = db.smallgroups.findOne({"_id":user.smallgroup});
        }
        var allfound = true;
        //Loop through all the attendance entries
        if (attendance){
            for (var a = 0; a < attendance.length ; a++){
                var date = attendance[a];
                var found  = false;
                //Find the correct attendance code in the classyear
                for (var b = 0; b < classyear.dayCodes.length ; b++){
                    if (sameDate(classyear.dayCodes[b].date, date)){
                        var daycode = classyear.dayCodes[b];
                        db.attendances.insert(
                            {
                                classYear: classyear._id,
                                user: user._id,

                                date: standardDate(date),
                                datetime: date,

                                bonusDay: daycode.bonusDay||false,
                                smallgroup: false,

                                verified: true,
                                code: daycode.code,
                            }
                        );
                        found = true;
                        break;
                    }
                }
                //If not found, find the correct attendance code in the smallgroup
                //Check to make sure there is a smallgroup for the user with daycodes
                if (!found && user.smallgroup && smallgroup && smallgroup.dayCodes){
                    for (var c = 0; c < smallgroup.dayCodes.length ; c++){
                        if (sameDate(smallgroup.dayCodes[c].date,date)){
                            var daycode = smallgroup.dayCodes[c];
                            db.attendances.insert(
                                {
                                    classYear: classyear._id,
                                    user: user._id,

                                    date: standardDate(date),
                                    datetime: date,

                                    bonusDay: false,
                                    smallgroup: true,

                                    verified: true,
                                    code: daycode.code,
                                }
                            );
                            found = true;
                            break;
                        }
                    }
                }
                if (!found){
                    allfound = false
                }
            }
        }
        //Loop through all the unverifiedAttendance entries
        if (unverifiedAttendance){
            for (var a = 0; a < unverifiedAttendance.length ; a++){
                var date = unverifiedAttendance[a];
                var found  = false;

                //Find the correct attendance code in the classyear
                for (var b = 0; b < classyear.dayCodes.length ; b++){
                    if (sameDate(classyear.dayCodes[b].date,date)){
                        var daycode = classyear.dayCodes[b];
                        db.attendances.insert(
                            {
                                classYear: classyear._id,
                                user: user._id,

                                date: standardDate(date),
                                datetime: date,

                                bonusDay: daycode.bonusDay||false,
                                smallgroup: false,

                                verified: false,
                                code: daycode.code,
                            }
                        );
                        found = true;
                        break;
                    }
                }

                //If not found, find the correct attendance code in the smallgroup
                //Check to make sure there is a smallgroup for the user with daycodes
                if (!found && user.smallgroup && smallgroup && smallgroup.dayCodes){
                    for (var c = 0; c < smallgroup.dayCodes.length ; c++){
                        if (sameDate(classyear.dayCodes[c].date,date)){
                            var daycode = smallgroup.dayCodes[c];
                            db.attendances.insert(
                                {
                                    classYear: classyear._id,
                                    user: user._id,

                                    date: standardDate(date),
                                    datetime: date,

                                    bonusDay: false,
                                    smallgroup: true,

                                    verified: false,
                                    code: daycode.code,
                                }
                            );
                            found = true;
                            break;
                        }
                    }
                }
            }
            if (!found){
                allfound = false
            }
        }
        //If not all the attendance entries were copied over, don't delete them from the user object
        //Otherwise, remove the attendance and unverifiedAttendance arrays
        if (allfound){
            db.users.update(
                { "_id": user._id },
                {
                    $unset: { attendance: 1, unverifiedAttendance: 1 }
                }
            );
            print("Migrated attendance for "+user.name+", attendance unset");
        }
        else{
            print("Failed to migrated all attendance for "+user.name+", attendance not unset");
        }
    });
}
