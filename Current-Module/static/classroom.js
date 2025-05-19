
        window.addEventListener("load", initialize);

        //Initializing Functions

        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //class teacher list (acadamic year ekata register nouna class teachers)
            cmbYear.addEventListener("change",teacherCH);

            //classroom name
            cmbClassCode.addEventListener("change",classroomNameCH);
            cmbGrade.addEventListener("change",classroomNameCH);
            cmbYear.addEventListener("change",classroomNameCH);

            privilages = httpRequest("../privilage?module=CLASSROOM","GET");

            //drop down ena than walata data genna gananna
            grades = httpRequest("../grade/list","GET");
            classroomcodes = httpRequest("../classcode/list","GET");
            statusts = httpRequest("../classrooomstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            acadamicyears = httpRequest("../acadamicyear/list","GET");
            teachers = httpRequest("../employee/list","GET");

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
            classrooms = new Array();
          var data = httpRequest("/classroom/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) classrooms = data.content;             //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);
            fillTable('tblClassroom',classrooms,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblClassroom);
            if(activerowno!="")selectRow(tblClassroom,activerowno,active);
        }

//******************
        function paginate(page) {
            var paginate;
            if(oldclassroom==null){
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
        function viewitem(clsrom,rowno) {

            classroom = JSON.parse(JSON.stringify(clsrom));

            tdClassName.innerHTML = classroom.name;
            tdLocation.innerHTML = classroom.location;
            tdDescription.innerHTML = classroom.description;
            tdAsignDate.innerHTML = classroom.addeddate;

            tdYear.innerHTML = classroom.acadamicyear_id.name;
            tdGrade.innerHTML = classroom.grade_id.name;
            tdTeacher.innerHTML = classroom.employee_id.callingname;
            tdClassCode.innerHTML = classroom.classcode_id.name;
            tdClassroomstatus.innerHTML = classroom.classrooomstatus_id.name;
            tdAddedBy.innerHTML = classroom.employee_id.callingname;

            $('#ClassroomVieweModal').modal('show'); //show model
         }


// print table
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;
             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 100px text-align: center; font-size:10px;'><h1>Classroom Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); },100);
         }

//class room name
        function classroomNameCH(){
            if(classroom.acadamicyear_id != null && classroom.grade_id != null && classroom.classcode_id){
                txtClassName.value = classroom.acadamicyear_id.name + "-" + classroom.grade_id.code + "-" + classroom.classcode_id.name;            //add value
                classroom.name = txtClassName.value;
            }
            //update kalama classroom name eke color change wenawa
            if(oldclassroom != null && classroom.name != oldclassroom.name){
                txtClassName.style.border = updated;
            }else {
                txtClassName.style.border = valid;
            }

        }

        function teacherCH(){
            //teacher list to classroom who have not selected as classteacher in this year
            classteacherbyyear = httpRequest("../employee/listbyteacherbyclass?ayid="+JSON.parse(cmbYear.value).id,"GET");
            fillCombo(cmbTeacher,"Select Teacher",classteacherbyyear,"callingname","");

        }

        function loadForm() {
            classroom = new Object();
            oldclassroom = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //fill data in to combo box
            fillCombo(cmbGrade,"Select Grade",grades,"name","");
            fillCombo(cmbClassCode,"Select Classroom Code",classroomcodes,"name","");
            fillCombo(cmbYear,"Select Year",acadamicyears,"name","");
            fillCombo3(cmbTeacher,"Select teacher",teachers,"callingname","nic", "");

            //fill and auto select , auto bind
            fillCombo(cmbClassroomstatus,"",statusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //convert to string
            classroom.classrooomstatus_id=JSON.parse(cmbClassroomstatus.value);
            cmbClassroomstatus.disabled = true;

            classroom.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAsignDate.value=today.getFullYear()+"-"+month+"-"+date;
            classroom.addeddate=dteAsignDate.value;
            dteAsignDate.disabled = true;

            //load wenakota text field empty
            txtClassName.value = "";
            txtLocation.value = "";
            txtDescription.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            dteAsignDate.style.border=valid;
            cmbClassroomstatus.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);
        }


        function setStyle(style) {

            cmbYear.style.border = style;
            cmbGrade.style.border = style;
            cmbClassCode.style.border = style;
            txtClassName.style.border = style;
            cmbTeacher.style.border = style;
            txtLocation.style.border = style;
            txtDescription.style.border = style;

            dteAsignDate.style.border = style;
            cmbClassroomstatus.style.border = style;
            cmbAddedBy.style.border = style;

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
            for(index in classrooms){
                if(classrooms[index].classrooomstatus_id.name =="Deleted"){
                    tblClassroom.children[1].children[index].style.color = "#f00";
                    tblClassroom.children[1].children[index].style.border = "2px solid red";
                    tblClassroom.children[1].children[index].lastChild.children[1].disabled = true;
                    tblClassroom.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";

                }
            }

        }


        function getErrors() {

            var errors = "";
            addvalue = "";

            if (classroom.acadamicyear_id == null)
                errors = errors + "\n" + "Acadamic Year is Not Entered";
            else  addvalue = 1;

            if (classroom.grade_id == null)
                errors = errors + "\n" + "Grade is Not Entered";
            else  addvalue = 1;

            if (classroom.classcode_id == null)
                errors = errors + "\n" + "Classroom code is Not Entered";
            else  addvalue = 1;

            if (classroom.classteacher_id == null)
                errors = errors + "\n" + "Class teacher is Not Entered";
            else  addvalue = 1;

            if (classroom.location == null)
                errors = errors + "\n" + "Location is Not Entered";
            else  addvalue = 1;

            return errors;

        }


        function btnAddMC(){
            if(getErrors()==""){
                if(txtDescription.value == "" ){
                    swal({
                        title: "Are you sure to continue?",
                        text: "Form has some empty fields.",
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
                title: "Are you sure to add following classroom?" ,
                text :
                    "\nAcadamic year: " + classroom.acadamicyear_id.name +
                    "\n Grade : " + classroom.grade_id.name +
                    "\nClassroom Clode : " + classroom.classcode_id.name +
                    "\nClassroom Name: " + classroom.name +
                    "\nClass Teacher : " + classroom.classteacher_id.callingname +
                    "\nLocation : " + classroom.location,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/classroom", "POST", classroom);
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
        function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();
            if(oldclassroom == null && addvalue == ""){
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
        }


        function fillForm(clsrom,rowno){
            activerowno = rowno;
            if (oldclassroom==null) {        //edit karanna kalin object eka
                filldata(clsrom);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(clsrom);
                    }
                });
            }
        }


        //when updating refill data into form
        function filldata(clsrom) {
            clearSelection(tblClassroom);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblClassroom,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            classroom = JSON.parse(JSON.stringify(clsrom));
            oldclassroom = JSON.parse(JSON.stringify(clsrom));

            txtClassName.value = classroom.name;
            txtLocation.value = classroom.location;
            txtDescription.value = classroom.description;
            dteAsignDate.value = classroom.addeddate;

            //fill combo predefine functtion ekak
            //fill data in to combo box
            fillCombo(cmbGrade,"",grades,"name",classroom.grade_id.name);
            fillCombo(cmbClassCode,"",classroomcodes,"name",classroom.classcode_id.name);
            fillCombo(cmbYear,"",acadamicyears,"name",classroom.acadamicyear_id.name);
            fillCombo3(cmbTeacher,"",teachers,"callingname","nic",classroom.classteacher_id.callingname);
            teacherCH();

            //fill and auto select , auto bind
            fillCombo(cmbClassroomstatus,"",statusts,"name",classroom.classrooomstatus_id.name);
            cmbClassroomstatus.disabled = false;             //update ekedith disable
            fillCombo(cmbAddedBy,"",employees,"callingname",classroom.employee_id.callingname);


            disableButtons(true, false, false);
            setStyle(valid);
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(classroom.description == null) txtDescription.style.border = initial;
        }

//finish
        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(classroom!=null && oldclassroom!=null) {

                if (classroom.acadamicyear_id.name != oldclassroom.acadamicyear_id.name)
                    updates = updates + "\nAcadamic Year is Changed " + oldclassroom.acadamicyear_id.name + " into " + classroom.acadamicyear_id.name;

                if (classroom.grade_id.name != oldclassroom.grade_id.name)
                    updates = updates + "\nGrade is Changed " + oldclassroom.grade_id.name + " into " + classroom.grade_id.name;

                if (classroom.classcode_id.name != oldclassroom.classcode_id.name)
                    updates = updates + "\nClassroom Code is Changed " + oldclassroom.classcode_id.name + " into " + classroom.classcode_id.name;

                if (classroom.name != oldclassroom.name)
                    updates = updates + "\nClassroom Name is Changed " + oldclassroom.name + " into " + classroom.name;

                if (classroom.classteacher_id.callingname != oldclassroom.classteacher_id.callingname)
                    updates = updates + "\nClass Teacher Name is Changed " + oldclassroom.classteacher_id.callingname + " into " + classroom.classteacher_id.callingname;

                if (classroom.location != oldclassroom.location)
                    updates = updates + "\nLocation is Changed " + oldclassroom.location + " into " + classroom.location;

                if (classroom.description != oldclassroom.description)
                    updates = updates + "\nDescription is Changed " + oldclassroom.description + " into " + classroom.description;

                if (classroom.classrooomstatus_id.name != oldclassroom.classrooomstatus_id.name)
                    updates = updates + "\nclassroom Status is Changed " + oldclassroom.classrooomstatus_id.name + " into " + classroom.classrooomstatus_id.name;

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
                        title: "Are you sure to update following classroom details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/classroom", "PUT", classroom);
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


        function btnDeleteMC(clsrom) {
            classroom = JSON.parse(JSON.stringify(clsrom));     //json string ekak karala object ekakta convert karanwa

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
           formattab = tblClassroom.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Classroom Details : </h1></div>" +
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

         var cprop = tblClassroom.firstChild.firstChild.children[cindex].getAttribute('property');

           if(cprop.indexOf('.') == -1) {
               employees.sort(
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
               employees.sort(
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
            fillTable('tblClassroom',employees,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblClassroom);
            loadForm();
            if(activerowno!="")selectRow(tblClassroom,activerowno,active);


        }