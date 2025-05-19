
        window.addEventListener("load", initialize);

        //Initializing Function
        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //exam name
            cmbGrade.addEventListener("change",cmbGradeCH);
            cmbGrade.addEventListener("change",cmbGradeDisableCH);
            cmbEvent.addEventListener("change",eventNameCH);

            //filter inner table subjects according to grade
            cmbGrade.addEventListener("change",btnsubjectCH);

            //when 'exam type = scholarship' enable some oprional fields as required
            cmbEvent.addEventListener("change",cmbEventCH);

            //filter exam type according to year
            cmbYear.addEventListener("change",cmbGradeCH);

            //enable scholarship inner form and fields
            cmbGrade.addEventListener("change",enableInputsCH);
            cmbEvent.addEventListener("change",enableInputsCH);

            //enable Term test inner form and fields
            cmbEvent.addEventListener("change",enableInputsTermTestCH);


            privilages = httpRequest("../privilage?module=EXAM","GET");

            //drop down ena than walata data genna gananna
            acadamicyears = httpRequest("../acadamicyear/list","GET");
            events = httpRequest("../eventdetail/list","GET");
            grades = httpRequest("../grade/list","GET");
            examstatusts = httpRequest("../examstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            //inner list
            subjects = httpRequest("../subjectdetail/list","GET");
            paperparts = httpRequest("../paperpart/list","GET");

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
            exams = new Array();
          var data = httpRequest("/exam/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) exams = data.content;                              //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);
            fillTable('tblExam',exams,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblExam);
            if(activerowno!="")selectRow(tblExam,activerowno,active);
        }

        //******************
        function paginate(page) {
            var paginate;
            if(oldexam==null){
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
                 "<body><div style='margin-top: 150px'><h1> Exam Details </h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); newwindow.close();},100);
         }

         function eventNameCH(){
             if(exam.acadamicyear_id != null && exam.eventdetail_id != null && exam.grade_id != null) {
                 txtname.value = exam.acadamicyear_id.name + " " + exam.grade_id.name + " " + exam.eventdetail_id.name;
                 exam.name = txtname.value;

                 //update kalama classroom name eke color change wenawa
                 if (oldexam != null && exam.name != oldexam.name) {
                     txtname.style.border = updated;
                 } else {
                     txtname.style.border = valid;
                 }
             }
         }


        function loadForm() {
            exam = new Object();
            oldexam = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //many to many insert
            exam.examHasSubjectList = new Array();
            exam.scholarshipExamList = new Array();

            //fill and auto select , auto bind
            fillCombo(cmbYear,"Select Year",acadamicyears,"name","");
            fillCombo(cmbEvent,"Select Event",events,"name","");
            fillCombo(cmbGrade,"Select Grade",grades,"name","");
            fillCombo(cmbStatus,"",examstatusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //convert to string
            exam.examstatus_id=JSON.parse(cmbStatus.value);
            cmbStatus.disabled = true;

            exam.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

            //date field
            var today = new Date();            //create date object
            var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
            if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var date = today.getDate();        // 1 to 31 range
            if(date<10) date = "0"+date;

            //Set Min and Max value for start date
            dteStart.min = getCurrentDateTime('date');
            dteEnd.min = getCurrentDateTime('date');
            let afteroneweek1 = new Date();
            afteroneweek1.setDate(today.getDate()+120);
            dteStart.max = afteroneweek1.getFullYear()+"-"+getmonthdate(afteroneweek1);
            dteEnd.max = afteroneweek1.getFullYear()+"-"+getmonthdate(afteroneweek1);

            //Set Min and Max value for application start date
            dteAppStart.min = getCurrentDateTime('date');
            dteAppEnd.min = getCurrentDateTime('date');
            let afteroneweek = new Date();
            afteroneweek.setDate(today.getDate()+60);
            dteAppStart.max = afteroneweek.getFullYear()+"-"+getmonthdate(afteroneweek);
            dteAppEnd.max = afteroneweek.getFullYear()+"-"+getmonthdate(afteroneweek);

            dteAddedDate.value=today.getFullYear()+"-"+month+"-"+date;
            exam.addeddate=dteAddedDate.value;
            dteAddedDate.disabled = true;

            // Get Next Number Form Data Base
            var nextNumber = httpRequest("/exam/nextnumber", "GET");
            txtExamcode.value = nextNumber.code;
            exam.code = txtExamcode.value;

            //load wenakota disable
            dteAppStart.disabled = true;
            dteAppEnd.disabled = true;
            btnSchoExam.disabled = true;
            btnTermTest.disabled = true;
            cmbGrade.disabled = true;
            cmbEvent.disabled = true;

            //load wenakota text field empty
            txtLocation.value = "";
            txtDescription.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            cmbStatus.style.border=valid;
            dteAddedDate.style.border=valid;
            cmbAddedBy.style.border=valid;
            txtExamcode.style.border=valid;

            disableButtons(false, true, true);

            refreshInnerdFormTermTest();
            refreshInnerdFormScho();
        }

//finish
 //innerform term test exam
        function refreshInnerdFormTermTest(){

            examhassubjectdetail = new Object();
            oldexamhassubjectdetail = null;

            //auto fill inner combo
            // fillCombo(cmbSubject,"Select Subject",subjects,"name","");
            fillCombo(CmbPaperPart,"Select Event",paperparts,"name","");

            CmbPaperPart.style.border = initial;
            cmbSubject.style.border = initial;
            dteDate.style.border = initial;
            timeStart.style.border = initial;
            TimeEnd.style.border = initial;

            //inner date time field
            var today = new Date();            //create date object
            var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
            if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var date = today.getDate();        // 1 to 31 range
            if(date<10) date = "0"+date;

            var hour = today.getHours();     // (00-23)
            if(hour<10) hour = "0"+hour;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var minut = today.getMinutes();        // 1 to 60 range
            if(minut<10) minut = "0"+minut;

           /* dteDate.min = getCurrentDateTime('date');
            dteDate.min =  dteStart.value;
            dteAppStart.min = getCurrentDateTime('date');
            dteAppEnd.min = getCurrentDateTime('date');
            let aftertwoweek = new Date();
            aftertwoweek.setDate(today.getDate()+14);
            dteSchoStart.max = aftertwoweek.getFullYear()+"-"+getmonthdate(aftertwoweek)+"T"+hour+":"+minut;
            dteSchoEnd.max = aftertwoweek.getFullYear()+"-"+getmonthdate(aftertwoweek)+"T"+hour+":"+minut;
*/
           /* dteTimeStart.value=today.getFullYear()+"-"+month+"-"+date+"T"+hour+":"+minut;
            examhassubjectdetail.startdatetime=dteTimeStart.value;
            dteTimeEnd.value=today.getFullYear()+"-"+month+"-"+date+"T"+hour+":"+minut;
            examhassubjectdetail.enddatetime=dteTimeEnd.value;*/


            //inner table
            fillInnerTable("tblInnerExam" , exam.examHasSubjectList , innerModifyTermTest, innerDeleteTermTest, innerViewTermTest);

            //inner edit eka disable
            if(exam.examHasSubjectList.length != 0){
                for (var index in exam.examHasSubjectList){
                    tblInnerExam.children[1].children[index].lastChild.children[0].style.display = "none";
                }
            }

            //inner subject filtering
            if(exam.examHasSubjectList.length != 0){
                btnsubjectCH();
            }else {
                fillCombo(cmbSubject,"Select Subject",subjects,"name","");
            }

        }

        function innerModifyTermTest(){}

        function btnInnerAddtTermTestMC(){

            var eventnext = false;
            for (var index in exam.examHasSubjectList){
                if (exam.examHasSubjectList[index].subjectdetail_id.name == examhassubjectdetail.subjectdetail_id.name &&
                    exam.examHasSubjectList[index].paperpart_id.name == examhassubjectdetail.paperpart_id.name){
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
                exam.examHasSubjectList.push(examhassubjectdetail);
                refreshInnerdFormTermTest();
            }
        }

        function innerDeleteTermTest(innerob,innerrow){

            swal({
                title: "Are you sure to remove following exam ?",
                text:
                    "\n Subject Name : " + innerob.subjectdetail_id.name +
                    "\n Paper Part : " + innerob.paperpart_id.name,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    exam.examHasSubjectList.splice(innerrow, 1);
                    refreshInnerdFormTermTest();
                }
            });
        }

        function innerViewTermTest(){}


//innerform term scholarship exam
        function refreshInnerdFormScho(){

            examhascholarshipexam = new Object();
            oldexamhascholarshipexam = null;

            cmbSchoPaperPart.style.border = initial;
            timeSchoStart.style.border = initial;
            timeSchoEnd.style.border = initial;
            dteExam.style.border = initial;

            fillCombo(cmbSchoPaperPart,"Select Paper Part",paperparts,"name","");

            //inner date time field
            var today = new Date();            //create date object
            var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
            if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var date = today.getDate();        // 1 to 31 range
            if(date<10) date = "0"+date;

            var hour = today.getHours();     // (00-23)
            if(hour<10) hour = "0"+hour;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var minut = today.getMinutes();        // 1 to 60 range
            if(minut<10) minut = "0"+minut;

            dteExam.min = getCurrentDateTime('date');
            let aftertwoweek = new Date();
            aftertwoweek.setDate(today.getDate()+90);
            dteExam.max = aftertwoweek.getFullYear()+"-"+getmonthdate(aftertwoweek);

            //inner table
            fillInnerTable("tblInnerScho" , exam.scholarshipExamList , innerModifyScho, innerDeleteScho, false);

            //inner edit eka disable
           /* if(exam.scholarshipExamList.length != 0){
                for (var index in exam.scholarshipExamList){
                    tblInnerScho.children[1].children[index].lastChild.children[0].style.display = "none";
                }
            }*/

        }

        function innerModifyScho(){}

        function innerDeleteScho(innerob,innerrow){
            swal({
                title: "Are you sure to remove following Exam ?",
                text:
                    "\n Paper Part : " + innerob.paperpart_id.name +
                    "\n Start Time : " + innerob.startdatetime +
                    "\n End Time : " + innerob.enddatetime,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    exam.scholarshipExamList.splice(innerrow, 1);
                    refreshInnerdFormScho();
                }
            });
        }

        function innerViewScho(){}

        function btnInnerAddSchMC(){

            var eventnext = false;
            for (var index in exam.scholarshipExamList){
                if (exam.scholarshipExamList[index].paperpart_id.name == examhascholarshipexam.paperpart_id.name){
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
                exam.scholarshipExamList.push(examhascholarshipexam);
                refreshInnerdFormScho();
            }
        }

//finish
        function setStyle(style) {

            txtname.style.border =  style;
            dteStart.style.border =  style;
            dteEnd.style.border =  style;
            dteAppStart.style.border =  style;
            dteAppEnd.style.border =  style;
            txtLocation.style.border =  style;
            txtDescription.style.border =  style;
            dteAddedDate.style.border =  style;

            cmbYear.style.border =  style;
            cmbGrade.style.border =  style;
            cmbEvent.style.border =  style;
            cmbStatus.style.border =  style;
            cmbAddedBy.style.border =  style;

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
            for(index in exams){
                if(exams[index].examstatus_id.name =="Deleted"){
                    tblExam.children[1].children[index].style.color = "#f00";
                    tblExam.children[1].children[index].style.border = "2px solid red";
                    tblExam.children[1].children[index].lastChild.children[1].disabled = true;
                    tblExam.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }

        }

 //finish
        function getErrors() {

            var errors = "";
            addvalue = "";

            if (exam.acadamicyear_id == null)
                errors = errors + "\n" + "Year is Not Entered";
            else  addvalue = 1;

            if (exam.grade_id == null)
                errors = errors + "\n" + "Grade is Not Entered";
            else  addvalue = 1;

            if (exam.location == null)
                errors = errors + "\n" + "Location is Not Entered";
            else  addvalue = 1;

            if (exam.eventdetail_id == null)
                errors = errors + "\n" + "Exam type is Not Entered";
            else {
                if(JSON.parse(cmbEvent.value).name == "Scholarship Exam"){
                    if (exam.application_start == null)
                        errors = errors + "\n" + "Application Start date is Not Entered";
                    else  addvalue = 1;

                    if (exam.application_end == null)
                        errors = errors + "\n" + "Application End Date is Not Entered";
                    else  addvalue = 1;

                    if (exam.scholarshipExamList.length  == 0){
                      //  cmbSubject.style.border = invalid;
                      //  CmbPaperPart.style.border = invalid;
                        errors = errors + "\n" + "Exam Detatils are Not Entered";
                    }else  addvalue = 1;

                }else {

                    if (exam.examHasSubjectList.length  == 0){
                        cmbSubject.style.border = invalid;
                        CmbPaperPart.style.border = invalid;
                        errors = errors + "\n" + "Term Test Subject Details are Not Entered";
                    }else  addvalue = 1;
                }


            }


            if (exam.startdate == null)
                errors = errors + "\n" + "Exam Start date is Not Entered";
            else  addvalue = 1;

            if (exam.enddate == null)
                errors = errors + "\n" + "Exam End Date is Not Entered";
            else  addvalue = 1;





            return errors;

        }

//finish
        function btnAddMC(){
            if(getErrors()==""){
                if(txtDescription.value == ""){
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
                    "\nExam Code : " + exam.code +
                    "\nExam Name : " + exam.name +
                    "\nStart Date : " + exam.startdate +
                    "\nEnd Date : " + exam.enddate +
                    "\nStatus : " + exam.examstatus_id.name,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/exam", "POST", exam);
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

//finish 
        function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();

            if(oldexam == null && addvalue == ""){
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
        function fillForm(exm,rowno){
            activerowno = rowno;
            if (oldexam==null) {        //edit karanna kalin object eka
                filldata(exm);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(exm);
                    }

                });
            }

        }

//finish
        //when updating refill data into form
        function filldata(exm) {
            clearSelection(tblExam);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblExam,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            exam = JSON.parse(JSON.stringify(exm));
            oldexam = JSON.parse(JSON.stringify(exm));

            //refill data into form
            txtExamcode.value = exam.code;
            txtname.value = exam.name;
            dteStart.value = exam.startdate;
            dteEnd.value = exam.enddate;
            dteAppStart.value = exam.application_start;
            dteAppEnd.value = exam.application_end;
            txtLocation.value = exam.location;
            txtDescription.value = exam.description;
            dteAddedDate.value = exam.addeddate;


            //fill combo predefine functtion ekak
            //fill data in to combo box
            //fill and auto select , auto bind

            fillCombo(cmbYear,"",acadamicyears,"name","");

            fillCombo(cmbEvent,"",events,"name","");
            cmbEvent.disabled = false;


            fillCombo(cmbGrade,"",grades,"name","");
            cmbGrade.disabled = false;

            fillCombo(cmbAddedBy,"",employees,"callingname",exam.employee_id.callingname);
            fillCombo(cmbStatus,"",examstatusts,"name","");
            cmbStatus.disabled = false;             //update ekedith disable

            if(exam.grade_id.name == "Grade 5") btnSchoExam.disabled = false;
            if(exam.grade_id.name == "Grade 1" || exam.grade_id.name == "Grade 2"|| exam.grade_id.name == "Grade 3" || exam.grade_id.name == "Grade 4") btnTermTest.disabled = false;

            disableButtons(true, false, false);
            setStyle(valid);

            refreshInnerdFormScho();
            refreshInnerdFormTermTest()
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(exam.description == null)txtDescription.style.border = initial;

        }

//finish
        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(exam!=null && oldexam!=null) {

                if (exam.acadamicyear_id.name != oldexam.acadamicyear_id.name)
                    updates = updates + "\nAcadamic Year is changed " + exam.acadamicyear_id.name + " into " + oldexam.acadamicyear_id.name;

                if (exam.grade_id.name != oldexam.grade_id.name)
                    updates = updates + "\nGrade is changed " + exam.grade_id.name + " into " + oldexam.grade_id.name;

                if (exam.eventdetail_id.name != oldexam.eventdetail_id.name)
                    updates = updates + "\nExam type is changed " + exam.eventdetail_id.name + " into " + oldexam.eventdetail_id.name;

                if (exam.name != oldexam.name)
                    updates = updates + "\nExam name is changed " + exam.name + " into " + oldexam.name;

                if (exam.startdate != oldexam.startdate)
                    updates = updates + "\nStart date is changed " + exam.startdate + " into " + oldexam.startdate;

                if (exam.enddate != oldexam.enddate)
                    updates = updates + "\nEnd date changed " + exam.enddate + " into " + oldexam.enddate;

                if (exam.application_start != oldexam.application_start)
                    updates = updates + "\nApplication start date is changed " + exam.application_start + " into " + oldexam.application_start;

                if (exam.application_end != oldexam.application_end)
                    updates = updates + "\nApplication end date changed " + exam.application_end + " into " + oldexam.application_end;

                if (exam.location != oldexam.location)
                    updates = updates + "\nLocation is Changed " + exam.location + " into " + oldexam.location;

                if (exam.description != oldexam.description)
                    updates = updates + "\nDescription is Changed " + exam.description + " into " + oldexam.description;

                if (exam.examstatus_id.name != oldexam.examstatus_id.name)
                    updates = updates + "\nExam Status is Changed " + exam.examstatus_id.name + " into " + exam.examstatus_id.name;

                if (isEqual(exam.examHasSubjectList, oldexam.examHasSubjectList, 'subjectdetail_id'))
                    updates = updates + "\nSubject detail is Changed";

                if (isEqual(exam.scholarshipExamList, oldexam.scholarshipExamList, 'subjectdetail_id'))
                    updates = updates + "\nSScholarship Exam detail is Changed";

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
                    title: 'Nothing Updated !',icon: "warning",
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
                            var response = httpRequest("/exam", "PUT", exam);
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
        function btnDeleteMC(exm) {
            exam = JSON.parse(JSON.stringify(exm));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following Examination  Details?",
                text:
                    "\n Exam Code : " + exam.code +
                    "\n Name : " + exam.name +
                    "\n start Date : " + exam.startdate +
                    "\n End date : " + exam.enddate,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/exam","DELETE", exam);
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
           formattab = tblExam.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Examination Details </h1></div>" +
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

         var cprop = tblExam.firstChild.firstChild.children[cindex].getAttribute('property');

           if(cprop.indexOf('.') == -1) {
               exam.sort(
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
               exams.sort(
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
            fillTable('tblExam',exams,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblExam);
            loadForm();

            if(activerowno!="")selectRow(tblExam,activerowno,active);



        }

        function cmbEventCH() {
            if(JSON.parse(cmbEvent.value).name == "Scholarship Exam"){
                dteAppStart.required = true;
                dteAppEnd.required = true;
            }else {
                dteAppStart.required = false;
                dteAppEnd.required = false;
            }
        }

         function btnsubjectCH(){
             subjectbygrade = httpRequest("/subjectdetail/listbystream?streamid="+JSON.parse(cmbGrade.value).stream_id.id, "GET");
             fillCombo(cmbSubject,"Select Subject Name",subjectbygrade,"name", "");
         }

         function cmbGradeCH(){
             cmbGrade.disabled = false;
            if(cmbYear.value != "" && cmbGrade.value != ""){
             eventbyyear = httpRequest("/eventdetail/listbyevent?acyid="+JSON.parse(cmbYear.value).id+"&gradeid="+JSON.parse(cmbGrade.value).id, "GET");
             fillCombo(cmbEvent,"Select Event",eventbyyear,"name", "");
            }
         }

         function enableInputsTermTestCH(){
             if(exam.eventdetail_id.name == "First Term Examination" || exam.eventdetail_id.name == "Second Term Examination" ||
                 exam.eventdetail_id.name == "Third Term Examination"){
                 btnTermTest.disabled = false;
                 cmbSubject.disabled = false;
                 CmbPaperPart.disabled = false;
                 dteDate.disabled = false;
                 timeStart.disabled = false;
                 TimeEnd.disabled = false;

             }else {
                 btnTermTest.disabled = true;
                 cmbSubject.disabled = true;
                 CmbPaperPart.disabled = true;
                 dteDate.disabled = true;
                 timeStart.disabled = true;
                 TimeEnd.disabled = true;
             }
         }

        function enableInputsCH(){
            if(exam.grade_id.name == "Grade 5" && exam.eventdetail_id.name == "Scholarship Exam"){
                btnSchoExam.disabled = false;
                dteAppEnd.disabled = false;
                dteAppStart.disabled = false;
                cmbSchoPaperPart.disabled = false;
                dteExam.disabled = false;
                timeSchoStart.disabled = false;
                timeSchoEnd.disabled = false;

            }else {
                btnSchoExam.disabled = true;
                dteAppEnd.disabled = true;
                dteAppStart.disabled = true;
                cmbSchoPaperPart.disabled = true;
                dteExam.disabled = true;
                timeSchoStart.disabled = true;
                timeSchoEnd.disabled = true;

            }

        }

        function cmbGradeDisableCH(){
            if (cmbGrade.value != "" ){
                cmbEvent.disabled = false;
            } else {
                cmbEvent.disabled = false;
            }
        }
