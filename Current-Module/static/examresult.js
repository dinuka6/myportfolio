
        window.addEventListener("load", initialize);

        //Initializing Function
        function initialize() {
            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable
        //    $('.js-example-basic-single').select2();       // type and search

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //student list according to classroom
            cmbClassroom.addEventListener("change",cmbStudentCH);

            //classroom according to loging user
     //       cmbClassroom.addEventListener("change",cmbclassroomCH);

            privilages = httpRequest("../privilage?module=EXAMRESULT","GET");

            //drop down ena than walata data genna gananna
            exams = httpRequest("../exam/list","GET");
            classrooms = httpRequest("../classroom/list","GET");
            subjects = httpRequest("../subjectdetail/list","GET");
            examresultstatusts = httpRequest("../examresultstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

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

//finish
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


        //fill data into table - finish
        function loadTable(page,size,query) {
            page = page - 1;
            examresults = new Array();
          var data = httpRequest("/examresult/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) examresults = data.content;                              //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);

            fillTable('tblExamResult',examresults,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblExamResult);

            if(activerowno!="")selectRow(tblExamResult,activerowno,active);

        }

        //******************
        function paginate(page) {
            var paginate;
            if(oldemployee==null){
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
        function viewitem(yer,rowno) {

            acayear = JSON.parse(JSON.stringify(yer));

            tdYearName.innerHTML = acayear.name;
            tdStartDate.innerHTML = acayear.startdate;
            tdEndDate.innerHTML = acayear.enddate;
            tdAcadamicFees.innerHTML = acayear.acadamicfee;
            tdSocietyFees.innerHTML = acayear.societyfee;
            tdStudentFees.innerHTML = acayear.studentfee;
            tdDescription.innerHTML = acayear.description;
            tdYearstatus.innerHTML = acayear.yearstatus_id.name;
            tdAddedDate.innerHTML = acayear.addeddate;

            fillInnerTable("tblPrintInnerYear" , acayear.acadamicyearHasEventdetailList, innerModify, innerDelete, innerView);

            $('#accadamicyearVieweModal').modal('show'); //show model

         }

         //row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 150px'><h1>Acadamic Year Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); newwindow.close();},100);
         }


//filter students accoding to classrom
        function cmbStudentCH() {

            //old object eka null wena awstawa =  inotial awastawa
            if (oldexamresult == null) {

                studentsbyclassroom = [];
                examresult.examresultHasStudentsList = [];
                studentsbyclassroom = httpRequest("/student/listbystudentbyclassroom?classid=" + JSON.parse(cmbClassroom.value).id, "GET");

                if (studentsbyclassroom.length != 0) {

                    for (var index in studentsbyclassroom) {

                        //inner object ekak create kara list ekata set kirima
                        var examresulHasStudent = new Object();                              //inner object ekak create kara list ekata set kirima
                        examresulHasStudent.student_id = studentsbyclassroom[index];        //set student
                        examresulHasStudent.marks = 0;                                      //set marks
                        examresulHasStudent.grade = "W";                                    //set gtade
                        examresult.examresultHasStudentsList.push(examresulHasStudent);       //push to list
                    }
                }
            }

            if (examresult.examresultHasStudentsList.length != 0) {
                var tbody = tblInnerStuMarks.children[1];       //body ekata data apend kirima, 1 = body eka / first child
                tbody.innerHTML = "";                           //initialy html body eka empty

                for (var index in examresult.examresultHasStudentsList) {

                    //td = columns
                    var tr = document.createElement('tr');
                    var td1 = document.createElement('td');
                    var td2 = document.createElement('td');
                    var td3 = document.createElement('td');
                    var td4 = document.createElement('td');

                    //input text marks
                    var inputtext = document.createElement('input');
                    inputtext.type = "text";
                    inputtext.classList.add("inputMarks");     //data list ekak add kara ganimata
                    inputtext.style.textAlign = "center";
                    inputtext.style.width = "100px";
                    inputtext.style.border = "2px solid #38040e";

                    //grade auto generate
                    var gadeCalculate = document.createElement('label');
                    // gadeCalculate.type = "text";
                    gadeCalculate.classList.add("gadeCalculate");
                    gadeCalculate.style.textAlign = "center";

                    //grade value calculating
                    inputtext.onkeyup = function () {
                   //     console.log(this.value)
                        if (this.value > 100) {
                            swal({
                                position: 'center',
                                icon: 'warning',
                                title: 'Please Enter Value \n Less Than 100..!',
                                text: '\n',
                                button: false,
                                timer: 1200
                            });
                            this.value = ""
                            this.parentNode.parentNode.lastChild.innerHTML = "";
                        }

                        if (this.value <= 100 && this.value >= 80 ) {
                  //          console.log(this.parentNode.parentNode.children[0].innerHTML)
                            this.style.border = valid;
                            this.parentNode.parentNode.lastChild.innerHTML = "Very Good";
                        }
                        else if (this.value >= 65 && this.value <= 79) {
                            this.style.border = valid;
                            this.parentNode.parentNode.lastChild.innerHTML = "Good";
                        }
                        else if (this.value >=50  && this.value <= 64) {
                            this.style.border = valid;
                            this.parentNode.parentNode.lastChild.innerHTML = "Normal";
                        }
                        else {
                            this.style.border = valid;
                            this.parentNode.parentNode.lastChild.innerHTML = "Weak";
                        }

                        if (this.value == "") {
                            this.style.border = initial;
                            this.parentNode.parentNode.lastChild.innerHTML = "";
                        }

                        var ind = this.parentNode.parentNode.children[0].innerHTML;
                        examresult.examresultHasStudentsList[parseInt(ind) - 1].marks = this.value;
                        examresult.examresultHasStudentsList[parseInt(ind) - 1].grade = this.parentNode.parentNode.lastChild.innerHTML;
                    };

                    td1.innerText = parseInt(index) + 1;                    //index numer (1,11,111,... wena eka nawattanna)
                    td2.innerText = examresult.examresultHasStudentsList[index].student_id.cname;
                    td3.appendChild(inputtext);
                    td4.appendChild(gadeCalculate);

                    //row ekata colums add karanawa
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    tr.appendChild(td3);
                    tr.appendChild(td4);
                    tbody.appendChild(tr);

                }
            }
        }


        function loadForm() {
            examresult = new Object();
            oldexamresult = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //many to many insert
            examresult.examresultHasStudentsList = new Array();

            //fill and auto select , auto bind
            fillCombo(cmbExamName,"Select Exam",exams,"name","");
            fillCombo(cmbClassroom,"Select Classroom",classrooms,"name","");
            fillCombo(cmbSubject,"Select Subject",subjects,"name","");
            fillCombo(cmbExamResultStatus,"",examresultstatusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            classroombyteacher = httpRequest("/classroom/listbyclassteacher?teacherid="+JSON.parse(cmbAddedBy.value).id, "GET");
            if(classroombyteacher.length != 0){
                fillCombo(cmbClassroom,"Select Classroom",classroombyteacher,"name",classroombyteacher[0].name);
                examresult.classroom_id = JSON.parse(cmbClassroom.value);
        //        cmbClassroom.style.border = active;
                cmbStudentCH();
            }else {
                fillCombo(cmbClassroom,"Select Classroom",classrooms,"name","");
                cmbClassroom.value = "";
            }

            //convert to string
            examresult.examresultstatus_id=JSON.parse(cmbExamResultStatus.value);
            cmbExamResultStatus.disabled = true;

            examresult.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAdded.value=today.getFullYear()+"-"+month+"-"+date;
            examresult.addeddate=dteAdded.value;
            dteAdded.disabled = true;

            // Get Next Number Form Data Base
            var nextNumber = httpRequest("/examresult/nextnumber", "GET");
            txtResultCode.value = nextNumber.resultcode;
            examresult.resultcode = txtResultCode.value;

            //load wenakota text field empty
            txtDescription.value = "";
//check
            //auto load ewata valid color enawa
            setStyle(initial);
                if(classroombyteacher != null){
                    cmbClassroom.style.border=valid;
                }

            //auto load disable ewata valid color enawa
            txtResultCode.style.border=valid;
            cmbExamResultStatus.style.border=valid;
            dteAdded.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);

 //           refreshInnerdForm();
        }

        /*
 //innerform -  finish
        function refreshInnerdForm(){
            examresulhasstudent = new Object();
            oldexamresulhasstudent = null;

            //auto fill inner combo
            fillCombo3(cmbStudentId,"Select Student",students,"cname","regno","");
            cmbStudentId.style.border = initial;

            txtMarks.style.border = initial;
            txtGrade.style.border = initial;

            //inner table
            fillInnerTable("tblInnerResults" , examresult.examresultHasStudentsList , innerModify, innerDelete, innerView);

            //inner edit eka disable
            if(examresult.examresultHasStudentsList.length != 0){
                for (var index in examresult.examresultHasStudentsList){
                    tblInnerResults.children[1].children[index].lastChild.children[0].style.display = "none";
                }
            }
        }

  //inner add -  finish
        function btnInnerAddMC(){

            var eventnext = false;
            for (var index in examresult.examresultHasStudentsList){
                if (examresult.examresultHasStudentsList[index].student_id.cname == examresulhasstudent.student_id.cname){
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
                examresult.examresultHasStudentsList.push(examresulhasstudent);
                refreshInnerdForm();
            }
        }

        function innerModify(){}

//finish
        function innerDelete(innerob,innerrow){

            swal({
                title: "Are you sure to remove following event ?",
                text: "\n" + "Event Name : " + innerob.student_id.cname ,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    examresult.examresultHasStudentsList.splice(innerrow, 1);
                    refreshInnerdForm();
                }

            });

        }

        function innerView(){}
        */

//finish
        function setStyle(style) {

            txtResultCode.style.border = style;
            txtDescription.style.border = style;
            dteAdded.style.border = style;

            cmbAddedBy.style.border = style;
            cmbExamName.style.border = style;
            cmbClassroom.style.border = style;
            cmbSubject.style.border = style;
            cmbExamResultStatus.style.border = style;

        }

 //finish
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
            for(index in examresults){
                if(examresults[index].examresultstatus_id.name =="Deleted"){
                    tblExamResult.children[1].children[index].style.color = "#f00";
                    tblExamResult.children[1].children[index].style.border = "2px solid red";
                    tblExamResult.children[1].children[index].lastChild.children[1].disabled = true;
                    tblExamResult.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }

        }

//finish
        function getErrors() {

            var errors = "";
            addvalue = "";

            if (examresult.exam_id == null)
                errors = errors + "\n" + "Exam Name is Not Entered";
            else  addvalue = 1;

            if (examresult.classroom_id == null)
                errors = errors + "\n" + "Classroom Name is Not Entered";
            else  addvalue = 1;

            if (examresult.subjectdetail_id == null)
                errors = errors + "\n" + "Subject is Not Entered";
            else  addvalue = 1;

        /*    if (examresult.examresultHasStudentsList.length  == 0){
                cmbStudentId.style.border = invalid;
                errors = errors + "\n" + "Student is Not Selected";
            }else  addvalue = 1;
*/
            return errors;

        }

//finish
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

//finish
        function savedata() {

            swal({
                title: "Are you sure to add Details?" ,
                text :
                    "\nExam Name : " + examresult.exam_id.name +
                    "\nClassroom : " + examresult.classroom_id.name +
                    "\nSubject : " + examresult.subjectdetail_id.name +
                    "\n Status : " + examresult.examresultstatus_id.name,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/examresult", "POST", examresult);
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

            if(oldexamresult == null && addvalue == ""){
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

//finish
        function fillForm(exmresult,rowno){
            activerowno = rowno;

            if (oldexamresult==null) {        //edit karanna kalin object eka
                filldata(exmresult);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(exmresult);
                    }

                });
            }

        }

//finish
        //when updating refill data into form
        function filldata(exmresult) {

            clearSelection(tblExamResult);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblExamResult,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            examresult = JSON.parse(JSON.stringify(exmresult));
            oldexamresult = JSON.parse(JSON.stringify(exmresult));

            //refill data into form
            txtResultCode.value = examresult.resultcode;
            txtDescription.value = examresult.description;
            dteAdded.value = examresult.addeddate;

            //fill combo predefine functtion ekak
            //fill data in to combo box
            //fill and auto select , auto bind
            /*fillCombo(cmbExamName,"",exams,"name",);*/
            fillCombo(cmbExamName,"",exams,"name",examresult.exam_id.name);
            fillCombo(cmbClassroom,"",classrooms,"name",examresult.classroom_id.name);
            fillCombo(cmbSubject,"",subjects,"name",examresult.subjectdetail_id.name);

            cmbStudentCH();
            cmbSubject.disabled = false;
            fillCombo(cmbAddedBy,"",employees,"callingname",examresult.employee_id.callingname);
/*
            fillCombo(cmbExamResultStatus,"",examresultstatusts,examresult.examresultstatus_id.callingname);
            cmbExamResultStatus.disabled = false;*/

            disableButtons(true, false, false);
            setStyle(valid);

            changeTab('form');

            //optional fields walata color eka set karanawa
            if(examresult.description == null)txtDescription.style.border = initial;

        }

 //finish
        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(examresult!=null && oldexamresult!=null) {

                if (examresult.exam_id.name != oldexamresult.exam_id.name)
                    updates = updates + "\nExam Name is Changed " + examresult.exam_id.name + " into " + oldexamresult.exam_id.name;

                if (examresult.classroom_id.name != oldexamresult.classroom_id.name)
                    updates = updates + "\nClassroom is Changed " + examresult.classroom_id.name + " into " + oldexamresult.classroom_id.name;

                if (examresult.subjectdetail_id.name != oldexamresult.subjectdetail_id.name)
                    updates = updates + "\nSubject is Changed " + examresult.subjectdetail_id.name + " into " + oldexamresult.subjectdetail_id.name;

                if (examresult.description != oldexamresult.description)
                    updates = updates + "\nDescription is Changed " + examresult.description + " into " + oldexamresult.description;

                if (examresult.examresultstatus_id.name != oldexamresult.examresultstatus_id.name)
                    updates = updates + "\nResult Status is Changed " + examresult.examresultstatus_id.name + " into " + oldexamresult.examresultstatus_id.name;

                if (isEqual(examresult.examresultHasStudentsList, examresult.examresultHasStudentsList, 'examresult_id'))
                    updates = updates + "\nStudent results is Changed";

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
                            var response = httpRequest("/examresult", "PUT", examresult);
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
        function btnDeleteMC(exmresult) {
            examresult = JSON.parse(JSON.stringify(exmresult));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following result Details?",
                text:
                    "\n Exam code : " + examresult.resultcode +
                    "\n Exam name : " + examresult.exam_id.name +
                    "\n Classroom : " + examresult.classroom_id.name +
                    "\n Subject : " + examresult.subjectdetail_id.name,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/examresult","DELETE",examresult);
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

        //table print - finish
       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblYear.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Result Details </h1></div>" +
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

         var cprop = tblEmployee.firstChild.firstChild.children[cindex].getAttribute('property');

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
            fillTable('tblEmployee',employees,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblEmployee);
            loadForm();

            if(activerowno!="")selectRow(tblEmployee,activerowno,active);



        }