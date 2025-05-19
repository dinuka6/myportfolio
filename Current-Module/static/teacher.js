
        window.addEventListener("load", initialize);

        //Initializing Function

        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //filter inner table subjects according to stream
            cmbStream.addEventListener("change",btnsubjectCH);

            privilages = httpRequest("../privilage?module=TEACHER","GET");

            //drop down ena than walata data genna gananna
            employeeteachers = httpRequest("../employee/listbyteacher","GET");
            teachergrades = httpRequest("../teachergrade/list","GET");
            teacherstatusts = httpRequest("../teacherstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            //inner list
            streams = httpRequest("../stream/list","GET");
            subjects = httpRequest("../subjectdetail/list","GET");
            qualifications = httpRequest("../qualification/list","GET");

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


        function loadTable(page,size,query) {
            page = page - 1;
            teachers = new Array();
          var data = httpRequest("/teacher/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) teachers = data.content;                              //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages,data.number+1,paginate);

            fillTable('tblTeacher',teachers,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblTeacher);

            if(activerowno!="")selectRow(tblTeacher,activerowno,active);

        }

//****************** finish
        function paginate(page) {
            var paginate;
            if(oldteacher==null){
                paginate=true;
            }else{
                if(getErrors()==''&&getUpdates()==''){
                    paginate=true;
                }else{
                    paginate = window.confirm("Form has Some Errors or Update Values." +
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

//row print
        function viewitem(techr,rowno) {
            teacher = JSON.parse(JSON.stringify(techr));

            tdAppoinment.innerHTML = teacher.appointmentdate;
            tdDutyAssign.innerHTML = teacher.deutyassigndate;
            tdPreviousSchool.innerHTML = teacher.previousschool;
            tdDescription.innerHTML = teacher.description;
            tdAddedDate.innerHTML = teacher.asigndate;
            tdTeacher.innerHTML = teacher.employee_id.callingname;
            tdTeacherGrade.innerHTML = teacher.teachergrade_id.name;
            tdTeacherstatus.innerHTML = teacher.teacherstatus_id.name;
            tdTeacherAddedby.innerHTML = teacher.employee_id.callingname;

            fillInnerTable("tblInnerPrintSubject" , teacher.teacherHasSubjectList, innerModify, innerDeleteTeachingSubject, innerView);
            fillInnerTable("tblInnerPrintQualification" , teacher.qualificationList, innerModify, innerDeleteQualification, innerView);

            $('#TeacherVieweModal').modal('show'); //show model

         }

//row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 150px'><h1>Teacher Details </h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print();},100);
         }


        function enableSubjectAddBTN(){
            if(cmbStream.value !="" && cmbSubject.value !=""){
                btnInnerAdd2.disabled = false;
            }
            else {
                btnInnerAdd2.disabled = true;
            }
        }

        function enableQualificationAddBTN(){
            if(txtEQName.value !="" && txtYear.value !="" && txtInstitute.value !="" && dteEffective.value !=""){
                btnInnerAdd.disabled = false;
            }
            else {
                btnInnerAdd.disabled = true;
            }
        }

        function loadForm() {
            teacher = new Object();
            oldteacher = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //many to many insert
            teacher.teacherHasSubjectList = new Array();
            teacher.qualificationList = new Array();

            //fill and auto select , auto bind
            fillCombo(cmbTeacherGrade,"Select Teacher's Grade",teachergrades,"name","");
            fillCombo(cmbTeacherstatus,"",teacherstatusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            fillCombo3(cmbTeacher,"Select Teacher",employeeteachers,"nic","callingname","");

            //convert to string
            teacher.teacherstatus_id=JSON.parse(cmbTeacherstatus.value);
            cmbTeacherstatus.disabled = true;

            teacher.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            //Set Min and Max value for date
            dteAppoinment.max = getCurrentDateTime('date');
            dteAppoinment.max = today.getFullYear()+"-"+month+"-"+date;

            dteDutyAssign.max = getCurrentDateTime('date');
            dteDutyAssign.max = today.getFullYear()+"-"+month+"-"+date;

            dteAddedDate.value=today.getFullYear()+"-"+month+"-"+date;
            teacher.asigndate=dteAddedDate.value;
            dteAddedDate.disabled = true;

            //load wenakota text field empty
            dteAppoinment.value = "";
            dteDutyAssign.value = "";
            txtPreviousSchool.value = "";
            txtDescription.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            cmbTeacherstatus.style.border=valid;
            dteAddedDate.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);

            refreshInnerdFormQualification();
            refreshInnerdFormTeachingSubject();
        }

//refresh innerform - Qualification
        function refreshInnerdFormQualification(){
            qualification = new Object();
            oldqualification = null;

            txtEQName.style.border = initial;
            txtInstitute.style.border = initial;
            txtYear.style.border = initial;
            dteEffective.style.border = initial;

            var today = new Date();            //create date object
            var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
            if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var date = today.getDate();        // 1 to 31 range
            if(date<10) date = "0"+date;

            //Set Min and Max value for date
            dteEffective.max = getCurrentDateTime('date');
            dteEffective.max = today.getFullYear()+"-"+month+"-"+date;

            txtEQName.value = "";
            txtInstitute.value = "";
            txtYear.value = "";
            dteEffective.value = "";

            btnInnerAdd.disabled = true;
            cmbSubject.disabled = true;

            //inner table
            fillInnerTable("tblInnerQualification" , teacher.qualificationList , innerModify, innerDeleteQualification, false);
        }

//inner add - Qualification
        function btnInnerQUalificationAddMC(){

            var eventnext = false;
            for (var index in teacher.qualificationList){
                if (teacher.qualificationList[index].name == qualification.name && teacher.qualificationList[index].institute == qualification.institute &&
                    teacher.qualificationList[index].year == qualification.year && teacher.qualificationList[index].effectivedate == qualification.effectivedate){
                    eventnext = true;
                    break;
                }
            }
            if (eventnext){
                swal({
                    title: 'Airedy exsist!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
            }else {
                teacher.qualificationList.push(qualification);
                refreshInnerdFormQualification();
            }
        }

//inner delete teaching Subject delete
        function innerDeleteQualification(innerob,innerrow){

            swal({
                title: "Are you sure to remove following subject ?",
                text: "\n" + "Subject Name : " + innerob.name,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    teacher.qualificationList.splice(innerrow, 1);
                    refreshInnerdFormQualification();
                }
            });

        }

//inner clear - qualification
        function btnInnerQUalificationClearMc() {

            if(txtEQName.value!="" || txtYear.value!="" || txtInstitute.value!="" || dteEffective.value!=""){
                swal({
                    title: "Form has some values, updates values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        refreshInnerdFormQualification();
                    }
                });
            } else {
                refreshInnerdFormQualification();
            }

        }


//refresh innerform Teaching Subject
        function refreshInnerdFormTeachingSubject(){
            subject = new Object();
            oldsubject = null;

            //auto fill inner combo
            fillCombo(cmbSubject,"Select Subject",subjects,"name","");
            cmbSubject.style.border = initial;

            fillCombo(cmbStream,"Select Stream",streams,"name","");
            cmbStream.style.border = initial;

            cmbSubject.style.border = initial;
            cmbStream.style.border = initial;

            btnInnerAdd2.disabled = true;

            //inner table
            fillInnerTable("tblInnerSubject" , teacher.teacherHasSubjectList , innerModify, innerDeleteTeachingSubject, false);


        }

//inner add - Subject
        function btnInnerSubjectAddMC(){

            var eventnext = false;
            for (var index in teacher.teacherHasSubjectList){
                if (teacher.teacherHasSubjectList[index].subjectdetail_id.name == subject.subjectdetail_id.name){
                    eventnext = true;
                    break;
                }
            }
            if (eventnext){
                swal({
                    title: 'Airedy exsist!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
            }else {
                teacher.teacherHasSubjectList.push(subject);
                refreshInnerdFormTeachingSubject();
            }

        }

//inner delete qualification delete
        function innerDeleteTeachingSubject(innerob,innerrow){

            swal({
                title: "Are you sure to remove following Qualification?",
                text: "\n" + "Qualification Name : " + innerob.name ,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    teacher.teacherHasSubjectList.splice(innerrow, 1);
                    refreshInnerdFormTeachingSubject();
                }
            });

        }

//inner clear - subject
        function btnInnerQSubjectClearMc(){

            if(cmbStream.value!="" || cmbSubject.value!=""){
                swal({
                    title: "Form has some values, updates values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        refreshInnerdFormTeachingSubject();
                    }
                });
            } else {
                refreshInnerdFormTeachingSubject();
            }
        }

        function innerModify(){}

        function innerView(){}


        function setStyle(style) {

            dteAppoinment.style.border = style;
            dteDutyAssign.style.border = style;
            txtPreviousSchool.style.border = style;
            txtDescription.style.border = style;
            cmbTeacher.style.border = style;
            cmbTeacherGrade.style.border = style;

            cmbTeacherstatus.style.border = style;
            dteAddedDate.style.border = style;
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
            for(index in teachers){
                if(teachers[index].teacherstatus_id.name =="Deleted"){
                    tblTeacher.children[1].children[index].style.color = "#f00";
                    tblTeacher.children[1].children[index].style.border = "2px solid red";
                    tblTeacher.children[1].children[index].lastChild.children[1].disabled = true;
                    tblTeacher.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }

        }

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (teacher.teacher_id == null)
                errors = errors + "\n" + "Teacher is Not Selected";
            else  addvalue = 1;

            if (teacher.appointmentdate == null)
                errors = errors + "\n" + "First Appoitment date is Not Selected";
            else  addvalue = 1;

            if (teacher.deutyassigndate == null)
                errors = errors + "\n" + "Duty Asign date is Not Selected";
            else  addvalue = 1;

            if (teacher.teachergrade_id == null)
                errors = errors + "\n" + "Teacher's Grade is Not Entered";
            else  addvalue = 1;

            //inner qualification
            if (teacher.qualificationList.length  == 0){
                txtEQName.style.border = invalid;
                txtInstitute.style.border = invalid;
                txtYear.style.border = invalid;
                dteEffective.style.border = invalid;
                errors = errors + "\n" + "Teachers Qualifications are Not Enterd";
            }else  addvalue = 1;

            //inner subject
            if (teacher.teacherHasSubjectList.length  == 0){
                cmbSubject.style.border = invalid;
                cmbStream.style.border = invalid;
                errors = errors + "\n" + "Teaching subjects are Not Enterd";
            }else  addvalue = 1;

            return errors;
        }


        function btnAddMC(){
            if(getErrors()==""){
                if(txtPreviousSchool.value == "" || txtDescription.value == "" ){
                    swal({
                        title: "Are you sure to continue ?",
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
                title: "Are you sure to add Details?" ,
                text :
                    "\nName : " + teacher.teacher_id.callingname +
                    "\nDuty Asign Date : " + teacher.deutyassigndate +
                    "\nTeachers Grade : " + teacher.teachergrade_id.name,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/teacher", "POST", teacher);
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

            if(oldteacher == null && addvalue == ""){
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


        function fillForm(techr,rowno){
            activerowno = rowno;
            if (oldteacher==null) {        //edit karanna kalin object eka
                filldata(techr);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(techr);
                    }
                });
            }
        }


//when updating refill data into form
        function filldata(techr) {
            clearSelection(tblTeacher);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblTeacher,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            teacher = JSON.parse(JSON.stringify(techr));
            oldteacher = JSON.parse(JSON.stringify(techr));

            //refill data into form
            dteAppoinment.value = teacher.appointmentdate;
            dteDutyAssign.value = teacher.deutyassigndate;
            txtPreviousSchool.value = teacher.previousschool;
            txtDescription.value = teacher.description;
            dteAddedDate.value = teacher.asigndate;
            /*cmbTeacher.value = teacher.teacher_id;*/
            cmbTeacherGrade.value = teacher.teachergrade_id;

            //fill combo predefine functtion ekak
            //fill data in to combo box
            //fill and auto select , auto bind
            fillCombo(cmbTeacherGrade,"",teachergrades,"name","");
            fillCombo(cmbTeacherstatus,"",teacherstatusts,"name","");
            cmbTeacherstatus.disabled = false;             //update ekedith disable
            fillCombo(cmbAddedBy,"",employees,"callingname",teacher.employee_id.callingname);

            fillCombo3(cmbTeacher,"",employeeteachers,"nic","callingname",teacher.teacher_id.callingname);
           /* fillCombo3(cmbTeacher,"",employees,"nic","callingname","");*/

            disableButtons(true, false, false);
            setStyle(valid);

            refreshInnerdFormQualification();
            refreshInnerdFormTeachingSubject();
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(teacher.description == null)txtDescription.style.border = initial;
            if(teacher.previousschool == null)txtPreviousSchool.style.border = initial;

        }

//change una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(teacher!=null && oldteacher!=null) {

                if (teacher.teacher_id.callingname != oldteacher.teacher_id.callingname)
                    updates = updates + "\nTeacher Name is Changed" + oldteacher.teacher_id.callingname + " into " + teacher.teacher_id.callingname;

                if (teacher.appointmentdate != oldteacher.appointmentdate)
                    updates = updates + "\nFirst appointment date is Changed " + oldteacher.appointmentdate + " into " + teacher.appointmentdate;

                if (teacher.deutyassigndate != oldteacher.deutyassigndate)
                    updates = updates + "\nDuty asign date Changed " + oldteacher.deutyassigndate + " into " + teacher.deutyassigndate;

                if (teacher.teachergrade_id.name != oldteacher.teachergrade_id.name)
                    updates = updates + "\nTeacher Grade is Changed " + oldteacher.teacher_id.name + " into " + teacher.name;

                if (teacher.previousschool != oldteacher.previousschool)
                    updates = updates + "\nPrevious school is Changed " + oldteacher.previousschool + " into " + teacher.previousschool;

                if (teacher.description != oldteacher.description)
                    updates = updates + "\nDescription is Changed " + oldteacher.description + " into " + teacher.description;

                if (teacher.teacherstatus_id.name != oldteacher.teacherstatus_id.name)
                    updates = updates + "\nStatus is Changed " + oldteacher.teacherstatus_id.name + " into " + teacher.teacherstatus_id.name;

                if (isEqual(teacher.teacherHasSubjectList, oldteacher.teacherHasSubjectList, 'subjectdetail_id'))
                    updates = updates + "\nTeaching subjects are Changed";

                if (isEqual(teacher.qualificationList, oldteacher.qualificationList, 'name'))
                    updates = updates + "\nQualification details are Changed";

            }
            return updates;
        }

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
                        title: "Are you sure to update following teacher details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/teacher", "PUT", teacher);
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

        function btnDeleteMC(techr) {
            teacher = JSON.parse(JSON.stringify(techr));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following teacher?",
                text:
                    "\n Teacher name : " + teacher.teacher_id.callingname +
                    "\n Teacher Grade : " + teacher.teachergrade_id.name +
                    "\n Status : " + teacher.teacherstatus_id.name,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/teacher","DELETE",teacher);
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


        function btnSearchClearMC(){
               loadView();
        }


       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblTeacher.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: center;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Teacher Details </h1></div>" +
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

         var cprop = tblTeacher.firstChild.firstChild.children[cindex].getAttribute('property');

           if(cprop.indexOf('.') == -1) {
               teachers.sort(
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
               teachers.sort(
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
            fillTable('tblTeacher',teachers,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblTeacher);
            loadForm();
            if(activerowno!="")selectRow(tblTeacher,activerowno,active);
        }


        function btnsubjectCH(){
            subjectbystream = httpRequest("/subjectdetail/listbystream?streamid="+JSON.parse(cmbStream.value).id, "GET");
            fillCombo(cmbSubject,"Select Subject",subjectbystream,"name", "");

            if(subject.stream_id.name != null){
                cmbSubject.disabled = false;
            }else {
                cmbSubject.disabled = true;
            }

        }