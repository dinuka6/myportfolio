
        window.addEventListener("load", initialize);

        //Initializing Function
        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //clssroom ekata adala student list eka
            cmbClassroom.addEventListener("change",cmbStudentCH);

            //year ekata adala class room list eka
            cmbYear.addEventListener("onload",cmbClassroomCH);

            //teacher ekata adala classroom list eka = load form


            //total students and absent auto calculate
          //  txtTotalStu.addEventListener("keyup",txtTotalStuKU);
          //  txtAbsent.addEventListener("keyup",txtAbsentStuKU);

            privilages = httpRequest("../privilage?module=ATTENDANCE","GET");

            //drop down ena than walata data genna gananna
            acadamicyears = httpRequest("../acadamicyear/list","GET");
            classrooms = httpRequest("../classroom/list","GET");
            employees = httpRequest("../employee/list","GET");
            schooldatstatusts = httpRequest("../schooldaystatus/list","GET");

            //inner list
            students = httpRequest("../student/list","GET");

            valid = "2px solid green";
            invalid = "2px solid red";
            initial = "2px solid #38040EFF";
            updated = "2px solid #ffcf56";
            active = "#538d22";

            //load view side
            loadView();

            //refresh form
           loadForm();

            changeTab('form');
        }

        function loadView() {
            //Search Area
            txtSearchName.value="";
            txtSearchName.style.background = "";

            //Table Area
            activerowno = "";
            activepage = 1;
            var query = "&searchtext=";
            loadTable(1,cmbPageSize.value,query);
        }

        //fill data into table
        function loadTable(page,size,query) {
            page = page - 1;
            schooldays = new Array();
            var data = httpRequest("/schoolday/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) schooldays = data.content;             //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);
            //paginate = page ekak click kalama weda karanne

            fillTable('tblSchoolday',schooldays,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblSchoolday);

            if(activerowno!="")selectRow(tblSchoolday,activerowno,active);

        }

//******************
        function paginate(page) {
            var paginate;
            if(oldschoolday==null){
                paginate=true;
            }else{
                if(getErrors()==''&&getUpdates()==''){
                    paginate=true;
                }else{
                    paginate = window.confirm("Form has Some Errors or Update Values. " +
                        "Are you sure to discard that changes ?");
                }
            }
            if(paginate) {
                activepage=page;
                activerowno=""
                loadForm();
                loadSearchedTable();
            }
        }

        //print
        function viewitem(schlday,rowno) {

            acayear = JSON.parse(JSON.stringify(schlday));

            tdcmbYear.innerHTML = schoolday.acadamicyear_id.name;
            tdcmbClassroom.innerHTML = schoolday.classroom_id.name;
            tddteSchoolDay.innerHTML = schoolday.schooldate;

            tdtxtTotalStu.innerHTML = schoolday.totalstudents;
            tdtxtHeadcount.innerHTML = schoolday.headcount;
            tdtxtAbsent.innerHTML = schoolday.absent;

            /*tdtxtDescription.innerHTML = schoolday.description;*/
            tddteAddedDateTime.innerHTML = schoolday.addeddatetime;
            tdcmbSchoolDayStatus.innerHTML = schoolday.schooldaystatus_id.name;
            tdCmbAddedby.innerHTML = schoolday.employee_id.callingname;

            if (schoolday.description != null) tdtxtDescription.value = schoolday.description; else tdtxtDescription.value="";

            fillInnerTable("tblInnerStuAttendPrint" , schoolday.schooldayHasStudentList, innerSchooldayModify, innerSchooldayDelete, innerSchooldayView);
            $('#schooldayVieweModal').modal('show'); //show model

         }

        function innerSchooldayModify(){}
        function innerSchooldayDelete(){}
        function innerSchooldayView(){}

         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 150px'><h1> Student Attendance :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); },100);
         }


         function cmbStudentCH(){
            //old object eka null wena awstawa =  inotial awastawa
            if(oldschoolday == null){
                studentsbyclassroom = [];
                schoolday.schooldayHasStudentList = [];
                    studentsbyclassroom = httpRequest("/student/listbystudentbyclassroom?classid="+JSON.parse(cmbClassroom.value).id, "GET");

                    if(studentsbyclassroom.length != 0) {

                    for (var index in studentsbyclassroom) {

                        //inner object ekak create kara list ekata set kirima
                        var schooldayHasStudent = new Object();
                        schooldayHasStudent.student_id = studentsbyclassroom[index];    //set student
                        schooldayHasStudent.attendance = true;                          //set attendance
                        schoolday.schooldayHasStudentList.push(schooldayHasStudent);    //push to list
                    }
                }
            }

            //length eka empty nettan if eka etule for loop eka run wenna oni
             if(schoolday.schooldayHasStudentList.length != 0){
                 var tbody = tblInnerStuAttend.children[1];             //body ekata data apend kirima, 1 = body eka / first child
                 tbody.innerHTML = "";                                   //initialy html body eka empty
                 var stucount = 0;
                 for (var index in schoolday.schooldayHasStudentList){

                     //td = columns
                     var tr = document.createElement('tr');
                     var td1 = document.createElement('td');
                     var td2 = document.createElement('td');
                     var td3 = document.createElement('td');
                     var td4 = document.createElement('td');

                     //input togle
                     var inputtoggle = document.createElement('input');
                     inputtoggle.type = "checkbox";
                     inputtoggle.classList.add("chkStuAttend");     //data list ekak add kara ganimata
                     inputtoggle.setAttribute('data-toggle', "toggle" );
                     inputtoggle.setAttribute('data-on', "Present" );
                     inputtoggle.setAttribute('data-off', "Absent" );
                     inputtoggle.setAttribute('data-onstyle', "success" );
                     inputtoggle.setAttribute('data-offstyle', "danger" );
                     inputtoggle.setAttribute('data-width', "120" );
                     inputtoggle.setAttribute('data-height', "10" );

                     inputtoggle.onchange = function () {

                         // lamai ganata if eka loop we. attendance = true nam +1, fals nam -1
                         if(this.checked){
                             //ind = input tag eke parent=div, div ge parent=td, td ge parent=tr , tr ge first child ge valu eka
                             var ind = this.parentNode.parentNode.parentNode.children[0].innerHTML;
                             schoolday.schooldayHasStudentList[parseInt(ind)-1].attendance = true;      //index number eken -1
                             stucount = stucount + 1 ;

                         }else{
                             stucount = stucount - 1;
                            var ind = this.parentNode.parentNode.parentNode.children[0].innerHTML;
                             schoolday.schooldayHasStudentList[parseInt(ind)-1].attendance = false;

                         }

                         //head count calculate
                         txtHeadcount.value = stucount;
                         schoolday.headcount = txtHeadcount.value;
                         txtHeadcount.style.border = valid;

                         //absents
                         txtAbsent.value = schoolday.schooldayHasStudentList.length - stucount;
                         schoolday.absent = txtAbsent.value;
                         txtAbsent.style.border = valid;

                     }

                     // total students
                     txtTotalStu.value = studentsbyclassroom.length;
                     schoolday.totalstudents = txtTotalStu.value;
                     txtTotalStu.style.border = valid;

                     td1.innerText = parseInt(index) + 1;
                     td2.innerText = schoolday.schooldayHasStudentList[index].student_id.regno;
                     td3.innerText = schoolday.schooldayHasStudentList[index].student_id.cname;
                     td4.appendChild(inputtoggle);

                     //row ekata colums add karanawa
                     tr.appendChild(td1);
                     tr.appendChild(td2);
                     tr.appendChild(td3);
                     tr.appendChild(td4);

                     tbody.appendChild(tr);
                 }

                 //active toggle
                 $('.chkStuAttend').bootstrapToggle('on');
             }

             //update ekedi schoolday.schooldayHasStudentList me list eken yanakota hama lamayama attend una kiyn eka nawattanna
             //old objet eke list ekata loop ekak danawa
             if(oldschoolday != null){
                 for (var index in oldschoolday.schooldayHasStudentList){
                     if(oldschoolday.schooldayHasStudentList[index].attendance == false){
                         //index ekata adala kena hoyan off karanawa (jquary functin eq)
                         $('.chkStuAttend:eq('+index+')').bootstrapToggle('off');
                     }
                 }
             }

         }

        function cmbClassroomCH(){
            classroombyyear = httpRequest("/classroom/listbyyear?yearid="+JSON.parse(cmbYear.value).id, "GET");
            fillCombo(cmbClassroom,"Select Classroom",classroombyyear,"name","");
        }

        function loadForm() {
            schoolday = new Object();
            oldschoolday = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //many to many insert
            schoolday.schooldayHasStudentList = new Array();

            //fill and auto select , auto bind
            fillCombo(cmbYear,"Select Year",acadamicyears,"name","");
            fillCombo(cmbSchoolDayStatus,"",schooldatstatusts,"name","Active");
            fillCombo(CmbAddedby,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);
            fillCombo(cmbClassroom,"Select Classroom",classrooms,"name","");
//classroom filtering according to class teacher
    //start
            if(session.getObject('activeuser').employeeId.designationId.id == 4) {
                classroombyteacher = httpRequest("/classroom/listbyclassteacher?teacherid="+JSON.parse(CmbAddedby.value).id, "GET");
                console.log(classroombyteacher);



                if(classroombyteacher.length != 0){
                    fillCombo(cmbClassroom,"Select Classroom",classroombyteacher,"name",classroombyteacher[0].name);
                    schoolday.classroom_id = JSON.parse(cmbClassroom.value);
                    cmbClassroom.style.border = valid;
                    cmbStudentCH();

                    fillCombo(cmbYear,"Select Year",acadamicyears,"name",classroombyteacher[0].acadamicyear_id.name);
                    schoolday.acadamicyear_id = JSON.parse(cmbYear.value);
                    cmbYear.style.border=valid;
                } else {
                    fillCombo(cmbClassroom,"Select Classroom",classrooms,"name","");
                    cmbClassroom.value ="";
                }
            }


            //convert to string
            schoolday.schooldaystatus_id=JSON.parse(cmbSchoolDayStatus.value);
            cmbSchoolDayStatus.disabled = true;

            schoolday.employee_id=JSON.parse(CmbAddedby.value);
            CmbAddedby.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            var hour = today.getHours();     // (00-23)
            if(hour<10) hour = "0"+hour;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var minut = today.getMinutes();        // 1 to 60 range
            if(minut<10) minut = "0"+minut;

            dteSchoolDay.value=today.getFullYear()+"-"+month+"-"+date;
            schoolday.schooldate=dteSchoolDay.value;
            console.log(today.getFullYear()+"-"+month+"-"+date+"T"+hour+":"+minut)
           /* dteSchoolDay.disabled = true;*/

            dteAddedDateTime.value=today.getFullYear()+"-"+month+"-"+date+"T"+hour+":"+minut;
            schoolday.addeddatetime=dteAddedDateTime.value;

            //Set Min and Max value for start date
           /* dteSchoolDay.min = getCurrentDateTime('date');
            let afteroneweek = new Date();
            afteroneweek.setDate(today.getDate()+0);
            dteSchoolDay.max = afteroneweek.getFullYear()+"-"+getmonthdate(afteroneweek);*/
          //  dteEnd.max = afteroneweek.getFullYear()+"-"+getmonthdate(afteroneweek);

            //load wenakota text field empty
            txtDescription.value ="";

            setStyle(initial)
            if(acadamicyears != null){
                cmbYear.style.border=valid;
            }

            //auto load disable ewata valid color enawa
            setStyle(initial);
            cmbSchoolDayStatus.style.border=valid;
            CmbAddedby.style.border=valid;
            dteSchoolDay.style.border=valid;
            dteAddedDateTime.style.border=valid;
            txtTotalStu.style.border=valid;
            txtHeadcount.style.border=valid;
            txtAbsent.style.border=valid;

             disableButtons(false, true, true);

           // refreshInnerdForm();
        }

        function setStyle(style) {
            dteSchoolDay.style.border = style;
            txtHeadcount.style.border = style;
            dteAddedDateTime.style.border = style;
            txtDescription.style.border = style;
            txtTotalStu.style.border = style;
            txtAbsent.style.border = style;

            cmbYear.style.border = style;
            cmbClassroom.style.border = style;
            cmbSchoolDayStatus.style.border = style;
            CmbAddedby.style.border = style;
        }

        function disableButtons(add, upd, del) {

            if (add || !privilages.add) {
                btnAdd.setAttribute("disabled", "disabled");
                $('#btnAdd').css('cursor','not-allowed');
            }
            else {
                btnAdd.removeAttribute("disabled");
                $('#btnAdd').css('cursor','pointer')
            }

            if (upd || !privilages.update) {
                btnUpdate.setAttribute("disabled", "disabled");
                $('#btnUpdate').css('cursor','not-allowed');
            }
            else {
                btnUpdate.removeAttribute("disabled");
                $('#btnUpdate').css('cursor','pointer');
             }

            if (!privilages.update) {
                $(".buttonup").prop('disabled', true);
                $(".buttonup").css('cursor','not-allowed');
            }
            else {
                $(".buttonup").removeAttr("disabled");
                $(".buttonup").css('cursor','pointer');
            }

            if (!privilages.delete){
                $(".buttondel").prop('disabled', true);
                $(".buttondel").css('cursor','not-allowed');
            }
            else {
                $(".buttondel").removeAttr("disabled");
                $(".buttondel").css('cursor','pointer');
            }

            // select deleted data row
            for(index in schooldays){
                if(schooldays[index].schooldaystatus_id.name =="Deleted"){
                    tblSchoolday.children[1].children[index].style.color = "#f00";
                    tblSchoolday.children[1].children[index].style.border = "2px solid red";
                    tblSchoolday.children[1].children[index].lastChild.children[1].disabled = true;
                    tblSchoolday.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }

        }

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (schoolday.acadamicyear_id == null)
                errors = errors + "\n" + "Year is Not Selected";
            else  addvalue = 1;

            if (schoolday.classroom_id == null)
                errors = errors + "\n" + "Classroom is Not Selected";
            else  addvalue = 1;

            return errors;

        }

        function btnAddMC(){
            console.log(schoolday)
            if(getErrors()==""){
                if(txtDescription.value == "" ){
                    swal({
                        title: "Are you sure to continue?",
                        text: "Form has some empty fields",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    }).then((willDelete) => {
                        if (willDelete) {
                            savedata();
                        }
                    });

                }else{
                    savedata();
                }
            }else{
                swal({
                    title: "You have following errors",
                    text: "\n"+getErrors(),
                    icon: "error",
                    button: true,
                });

            }
        }

        function savedata() {

            swal({
                title: "Are you sure to add following details?" ,
                text :
                    "\nSchool Date : " + schoolday.schooldate +
                    "\nClassroom : " + schoolday.classroom_id.name +
                    "\nHead Count : " + schoolday.headcount,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/schoolday", "POST", schoolday);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n Save SuccessFully..!',
                            text: '\n',
                            button: false,
                            timer: 1200
                        });
                        activepage = 1;
                        activerowno = 1;        // add une palaweni row eka
                        loadSearchedTable();
                        loadForm();
                        changeTab('table');
                    }
                    else swal({
                        title: 'Save not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true
                    });
                }
            });

        }

        function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();

            if(oldschoolday == null && addvalue == ""){
                loadForm();
            }else{
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        loadForm();
                    }
                });
            }

        }

        function fillForm(schday,rowno){
            activerowno = rowno;

            if (oldschoolday==null) {        //edit karanna kalin object eka
                filldata(schday);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(schday);
                    }
                });
            }
        }


        //when updating refill data into form
        function filldata(schday) {
            clearSelection(tblSchoolday);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblSchoolday,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            schoolday = JSON.parse(JSON.stringify(schday));
            oldschoolday = JSON.parse(JSON.stringify(schday));

            //refill data into form
            dteSchoolDay.value = schoolday.schooldate;
            dteAddedDateTime.value = schoolday.addeddatetime;
            txtDescription.value = schoolday.description;

            txtHeadcount.value = schoolday.headcount;
            txtTotalStu.value = schoolday.totalstudents;
            txtAbsent.value = schoolday.absent;


            //fill combo predefine functtion ekak
            //fill data in to combo box
            //fill and auto select , auto bind
            fillCombo(cmbYear,"",acadamicyears,"name",schoolday.acadamicyear_id.name);
            cmbYear.disabled = true;
            cmbClassroomCH();

            fillCombo(cmbClassroom,"",classrooms,"name",schoolday.classroom_id.name);
            cmbClassroom.disabled = true;
            cmbStudentCH();

            fillCombo(cmbSchoolDayStatus,"",schooldatstatusts,"name",schoolday.schooldaystatus_id.name);
            cmbSchoolDayStatus.disabled = false;             //update ekedith disable

            fillCombo(CmbAddedby,"",employees,"callingname",schoolday.employee_id.callingname);

            disableButtons(true, false, false);
            setStyle(valid);

            changeTab('form');

            //optional fields walata color eka set karanawa
            if(schoolday.description == null)txtDescription.style.border = initial;

        }

//finish
        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(schoolday!=null && oldschoolday!=null) {

                if (schoolday.acadamicyear_id.name != oldschoolday.acadamicyear_id.name)
                    updates = updates + "\nAcadamic year is Changed " + schoolday.acadamicyear_id.name + " into " + oldschoolday.acadamicyear_id.name;

                if (schoolday.classroom_id.name != oldschoolday.classroom_id.name)
                    updates = updates + "\nClassroom Name is Changed " + schoolday.classroom_id.name + " into " + oldschoolday.classroom_id.name;

                if (schoolday.schooldate != oldschoolday.schooldate)
                    updates = updates + "\nSchool date is changed " + schoolday.schooldate + " into " + oldschoolday.schooldate;

                if (schoolday.headcount != oldschoolday.headcount)
                    updates = updates + "\nHead Count is Changed " + schoolday.headcount + " into " + oldschoolday.headcount;

                if (schoolday.description != oldschoolday.description)
                    updates = updates + "\nDescription is Changed " + schoolday.description + " into " + oldschoolday.description;

                if (schoolday.schooldaystatus_id.name != oldschoolday.schooldaystatus_id.name)
                    updates = updates + "\nDay Status is Changed " + schoolday.schooldaystatus_id.name + " into " + oldschoolday.schooldaystatus_id.name;

                if (isEqual(schoolday.schooldayHasStudentList, oldschoolday.schooldayHasStudentList, 'student_id'))
                    updates = updates + "\nAttendance is Changed";
            }

            return updates;

        }

 //finish
        function btnUpdateMC() {
            var errors = getErrors();       // update check karanna kalin errors check karanna oni nisa
            if (errors == "") {
                var updates = getUpdates();
                if (updates == "")
                    swal({
                    title: 'Nothing Updated..!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
                else {
                    swal({
                        title: "Are you sure to update following duardian details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/schoolday", "PUT", schoolday);
                            if (response == "0") {
                                swal({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Your work has been Done \n Update SuccessFully..!',
                                    text: '\n',
                                    button: false,
                                    timer: 1200
                                });
                                loadSearchedTable();
                                loadForm();
                                changeTab('table');

                            }
                            else
                                swal({
                                    title: 'Failed to Update!',icon: "error",
                                    text: 'You have following errors..\n '+response,
                                    button: true});
                        }
                        });
                }
            }
            else
                swal({
                    title: 'You have following errors in your form',icon: "error",
                    text: '\n '+getErrors(),
                    button: true});

        }

//finish
        function btnDeleteMC(schday) {
            schoolday = JSON.parse(JSON.stringify(schday));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following Attendance Details?",
                text:
                    "\n Date : " + schoolday.schooldate +
                    "\n Classroom : " + schoolday.classroom_id.name +
                    "\n Head Count : " + schoolday.headcount,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/schoolday","DELETE",schoolday);
                    if (responce==0) {
                        swal({
                            title: "Deleted Successfully....!",
                            text: "\n\n  Status change to delete",
                            icon: "success", button: false, timer: 1200,
                        });
                        loadSearchedTable();
                        loadForm();
                    } else {
                        swal({
                            title: "You have following erros!",
                            text: "\n\n" + responce,
                            icon: "error", button: true,
                        });
                    }
                }
            });

       }

        function loadSearchedTable() {

            var searchtext = txtSearchName.value;
            var query ="&searchtext=";

            if(searchtext!="")
                query = "&searchtext=" + searchtext;
            //window.alert(query);

            loadTable(activepage, cmbPageSize.value, query);        // for load table

            //disable delete button when searching
            disableButtons(false, true, true);

        }

        function btnSearchMC(){
            activepage=1;
            loadSearchedTable();
        }

        //*************
        function btnSearchClearMC(){
               loadView();
        }

//finish
        //table print
       function btnPrintTableMC() {
           var newwindow=window.open();
           formattab = tblSchoolday.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> STdent Attendance </h1></div>" +
               "<div>"+ formattab+"</div>"+
               "</body>" +
               "</html>");
           setTimeout(function () {newwindow.print();
              // newwindow.close();
               },100) ;
        }

        //*************
        function sortTable(cind) {
            cindex = cind;

         var cprop = tblSchoolday.firstChild.firstChild.children[cindex].getAttribute('property');

           if(cprop.indexOf('.') == -1) {
               schooldays.sort(
                   function (a, b) {
                       if (a[cprop] < b[cprop]) {
                           return -1;
                       } else if (a[cprop] > b[cprop]) {
                           return 1;
                       } else {
                           return 0;
                       }
                   }
               );
           }else {
               schooldays.sort(
                   function (a, b) {
                       if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] < b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                           return -1;
                       } else if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] > b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                           return 1;
                       } else {
                           return 0;
                       }
                   }
               );
           }
            fillTable('tblSchoolday',schooldays,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblSchoolday);
            loadForm();

            if(activerowno!="")selectRow(tblSchoolday,activerowno,active);

        }



