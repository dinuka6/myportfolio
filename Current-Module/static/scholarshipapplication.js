
        window.addEventListener("load", initialize);

        //Initializing Functions

        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
          //  btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            privilages = httpRequest("../privilage?module=SCHOLARSHIPAPPLICATION","GET");

            //get event details only related for scho exams
            studentlistbyclassroom = [];

            //event list according to acadamic year
            cmbYear.addEventListener("change",cmbyearCH);

            //drop down ena than walata data genna gananna
            exams = httpRequest("../exam/list","GET");
            studdents = httpRequest("../student/list","GET");
            acadamicyears = httpRequest("../acadamicyear/list","GET");
            classrooms = httpRequest("../classroom/list","GET");
            employees = httpRequest("../employee/list","GET");

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

//fill data into table      finish
        function loadTable(page,size,query) {
            page = page - 1;
            schoapplications = new Array();
          var data = httpRequest("/scholarshipapplication/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) schoapplications = data.content;             //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);

            fillTable('tblSchoApp',schoapplications,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblSchoApp);

            if(activerowno!="")selectRow(tblSchoApp,activerowno,active);

        }


//******************
        function paginate(page) {
            var paginate;
            if(oldschoapplication==null){
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

//print -  not finiah
        function viewitem(schapp,rowno) {
            schoapplication = JSON.parse(JSON.stringify(schapp));

            tdStudent.innerHTML = schoapplication.student_id.cname;
            tdApplyDateTime.innerHTML = schoapplication.applydatetime;

            $('#SchoAppliModal').modal('show'); //show model

         }


//row print - finish
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 100px text-align: center; font-size:10px;'><h1>Scholaship Exam Application Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print();});
         }


        function cmbyearCH(){

            schoexam = httpRequest("/exam/listonlyschoexam?yearid="+JSON.parse(cmbYear.value).id, "GET");
            fillCombo(cmbExamName,"Select Exam Name",schoexam,"name", "");

        }


        function loadForm() {
            schoapplication = new Object();
            oldschoapplication = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //fill data in to combo box
            fillCombo(cmbExamName,"Select Exam Name",exams,"name","");
            fillCombo(cmbYear,"Select Exam",acadamicyears,"name","");
            fillCombo(cmbClassroom,"Select Classroom",classrooms,"name","");

            //fill and auto select , auto bind
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //Set the student of classroom
           // studentlistbyclassroom = httpRequest("../student/listbystudentbyclassroom?classid=" + JSON.parse(cmbClassroom.value).id, "GET");
            //   fillCombo3(cmbStudent,"Select Student",studentlistbyclassroom,"indexno","callingname","");

            //convert to string
            schoapplication.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

            var today = new Date();            //create date object
            var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
            if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var date = today.getDate();        // 1 to 31 range
            if(date<10) date = "0"+date;

            var hour = today.getHours();     // (00-23)
            if(hour<10) hour = "0"+hour;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var minut = today.getMinutes();        // 1 to 60 range
            if(minut<10) minut = "0"+minut;

            dteApplyDateTime.value=today.getFullYear()+"-"+month+"-"+date+"T"+hour+":"+minut;
            schoapplication.applydatetime=dteApplyDateTime.value;

            //auto load disable ewata valid color enawa
            setStyle(initial);
            cmbExamName.style.border=valid;
            dteApplyDateTime.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);
        }

        function setStyle(style) {
            cmbExamName.style.border = style;
            cmbYear.style.border = style;
            cmbClassroom.style.border = style;
            cmbAddedBy.style.border = style;
            dteApplyDateTime.style.border = style;
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
           /* for(index in schoapplocations){
                if(schoapplocations[index].classrooomstatus_id.name =="Deleted"){
                    tblSchoApp.children[1].children[index].style.color = "#f00";
                    tblSchoApp.children[1].children[index].style.border = "2px solid red";
                    tblSchoApp.children[1].children[index].lastChild.children[1].disabled = true;
                    tblSchoApp.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }*/
        }

        function getErrors() {
            var errors = "";
            addvalue = "";

            if (schoapplication.acadamicyear_id == null)
                errors = errors + "\n" + "Acadamic Year is Not Selected";
            else  addvalue = 1;

            if (schoapplication.classroom_id == null)
                errors = errors + "\n" + "Classroom is Not Selected";
            else  addvalue = 1;

            return errors;

        }

//original
       /* function btnAddMC(){
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

        }*/

        function btnAddMC(){
            if(getErrors()==""){
                savedata();
            }else{
                swal({
                    title: "You have following errors",
                    text: "\n"+getErrors(),
                    icon: "error",
                    button: true,
                });
            }

        }

//all add function
        function btnAddAllMC(){

            studentsbyclassroom = httpRequest("/student/listbystudentbyclassroom?classid="+JSON.parse(cmbClassroom.value).id, "GET");
            var studentlistbyclassroom = studentsbyclassroom.length;

            swal({
                text :
                    "\nExam Name  : " + schoapplication.exam_id.name +
                    "\nYear : " + schoapplication.acadamicyear_id.name +
                    "\nClassroom : " + schoapplication.classroom_id.name +
                    "\nStudent Count : " + studentlistbyclassroom ,
                title: "Are you sure to add All Classroom Students...?" ,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {

                    var allsave = false;

                    for (var index in studentsbyclassroom){
                        schoapplication.student_id = studentsbyclassroom[index];
                        console.log(schoapplication)
                        var response = httpRequest("/scholarshipapplication", "POST", schoapplication);
                        if (response == "0") {
                            allsave = true;
                        }
                        else swal({
                            title: studentsbyclassroom[index].cname+' application  Save not Success... , You have following errors', icon: "error",
                            text: '\n ' + response,
                            button: true
                        });
                    }

                    if(allsave){
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n All Applications are Saved SuccessFully..!',
                            text: '\n',
                            button: false,
                            timer: 1200
                        });
                        activerowno = 1;
                        loadSearchedTable();
                        loadForm();
                        changeTab('table');
                        $('#formmodle').modal('hide');
                    }
                }
            });

        }


        function savedata() {

            swal({
                title: "Are you sure to add following Exam Application Deatails?" ,
                text :
                    "\nYear: " + schoapplication.acadamicyear_id.name +
                    "\nClassroom: " + schoapplication.classroom_id.name +
                    "\nApply Date Time  : " + schoapplication.applydatetime,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/scholarshipapplication", "POST", schoapplication);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n Save SuccessFully!',
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

        //*************
       /* function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();

            if(oldemployee == null && addvalue == ""){
                loadForm();
            }else{
                swal({
                    title: "Form has some values, updates values... Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        loadForm();
                    }

                });
            }
        }*/


        function fillForm(schapp,rowno){
            activerowno = rowno;

            if (oldschoapplication==null) {        //edit karanna kalin object eka
                filldata(schapp);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(schapp);
                    }
                });
            }
        }

        //when updating refill data into form
        function filldata(schapp) {
            clearSelection(tblSchoApp);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblSchoApp,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            schoapplication = JSON.parse(JSON.stringify(schapp));
            oldschoapplication = JSON.parse(JSON.stringify(schapp));

            dteApplyDateTime.value = schoapplication.applydatetime;

            //fill combo predefine functtion ekak
            //fill data in to combo box
            fillCombo(cmbExamName,"",exams,"name",schoapplication.exam_id.name);
            fillCombo(cmbYear,"",acadamicyears,"name",schoapplication.acadamicyear_id.name);
            fillCombo(cmbClassroom,"",classrooms,"name",schoapplication.classroom_id.name);

            //fill and auto select , auto bind
           fillCombo(cmbAddedBy,"",employees,"callingname",schoapplication.employee_id.callingname);

            //disableButtons(true, false, false);
            setStyle(valid);
            changeTab('form');
        }


        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(schoapplication!=null && oldschoapplication!=null) {

                if (schoapplication.acadamicyear_id.name != oldschoolday.acadamicyear_id.name)
                    updates = updates + "\nYear is Changed" + schoapplication.acadamicyear_id.name + " into " + oldschoapplication.acadamicyear_id.name;

                if (schoapplication.classroom_id.name != oldschoolday.classroom_id.name)
                    updates = updates + "\nYear is Changed" + schoapplication.classroom_id.name + " into " + oldschoapplication.classroom_id.name;

            }
            return updates;
        }

        function btnUpdateMC() {
            var errors = getErrors();       // update check karanna kalin errors check karanna oni nisa
            if (errors == "") {
                var updates = getUpdates();
                if (updates == "")
                    swal({
                    title: 'Nothing Updated!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
                else {
                    swal({
                        title: "Are you sure to update following exam details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/scholarshipapplication", "PUT", schoapplication);
                            if (response == "0") {
                                swal({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Your work has been Done \n Update SuccessFully!',
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

//see
        function btnDeleteMC(clsrom) {
/*            classroom = JSON.parse(JSON.stringify(clsrom));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following classroom?",
                text:
                    "\n Acadamic Year : " + classroom.acadamicyear_id.name +
                    "\n Classroom Name : " + classroom.name +
                    "\n Clas Teacher : " + classroom.employee_id.name,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/classroom","DELETE",classroom);
                    if (responce==0) {
                        swal({
                            title: "Deleted Successfully!",
                            text: "\n\n  Status change to delete",
                            icon: "success", button: false, timer: 1200,
                        });
                        loadSearchedTable();
                        loadForm();
                    } else {
                        swal({
                            title: "You have following erros....!",
                            text: "\n\n" + responce,
                            icon: "error", button: true,
                        });
                    }
                }
            });
*/
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

        function btnSearchClearMC(){
               loadView();
        }


//table print
       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblSchoApp.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Scholarship Exam Details </h1></div>" +
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

         var cprop = tblSchoApp.firstChild.firstChild.children[cindex].getAttribute('property');

           if(cprop.indexOf('.') == -1) {
               schoapplication.sort(
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
               schoapplication.sort(
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
            fillTable('tblSchoApp',schoapplications,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblSchoApp);
            loadForm();

            if(activerowno!="")selectRow(tblSchoApp,activerowno,active);

        }