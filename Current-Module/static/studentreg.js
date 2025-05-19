
        window.addEventListener("load", initialize);

//Initializing Functions
        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            $('.js-example-basic-single').select2();       //type and search

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            cmbStudentId.addEventListener("change",cmbStudentIdCH);

            //year eken data genna ganimata evennt listner create kalara
            cmbAcadamicYear.addEventListener("change",cmbAcadamicYearCH);

            cmbGrade.addEventListener("change",cmbClassroomIdCH);
            cmbClassroomname.addEventListener("change",cmbSudentsIdCH);

            privilages = httpRequest("../privilage?module=STUDENTREGISTRATION","GET");

            //drop down ena than walata data genna gananna
            acadamicyears = httpRequest("../acadamicyear/list","GET");
            grades = httpRequest("../grade/list","GET");
            students = httpRequest("../student/list","GET");
            classrooms = httpRequest("../classroom/list","GET");


            registrationstatus = httpRequest("../studentregstatus/list","GET");
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

//fill data into table
        function loadTable(page,size,query) {
            page = page - 1;
            studenregs = new Array();
          var data = httpRequest("/studentregistration/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) studenregs = data.content;             //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);

            fillTable('tblstudentreg',studenregs,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblstudentreg);

            if(activerowno!="")selectRow(tblstudentreg,activerowno,active);

        }

        function paginate(page) {
            var paginate;
            if(oldstudentreg==null){
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
        function viewitem(stureg,rowno) {

            studentreg = JSON.parse(JSON.stringify(stureg));

            tdAcadamicYear.innerHTML = studentreg.acadamicyear_id.name;
            tdGrade.innerHTML = studentreg.grade_id.name;
            tdDescription.innerHTML = studentreg.description;
            tdAcadamicfee.innerHTML = studentreg.acadamicfee;
            tdSocietyfee.innerHTML = studentreg.societyfee;
            tdTotalfee.innerHTML = studentreg.totalfee;

            tdStudentId.innerHTML = studentreg.student_id.name;
            tdClassroomname.innerHTML = studentreg.classroom_id.name;
            tdStudentRegStatus.innerHTML = studentreg.studentregstatus_id.name;
            tdAddeddate.innerHTML = studentreg.addeddate;

            $('#StuRegiVieweModal').modal('show'); //show model

         }

         //row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 100px text-align: center; font-size:10px;'><h1>Student Registration Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             newwindow.print();
            // setTimeout(function () {newwindow.print(); },10);
         }

        function cmbStudentIdCH() {
            var regcount = httpRequest("../studentregistration/countbystudentay?studentid="+JSON.parse(cmbStudentId.value).id+"&ayid="+JSON.parse(cmbAcadamicYear.value).id,"GET");
            var reglist = httpRequest("../studentregistration/listbystudentay?studentid="+JSON.parse(cmbStudentId.value).id+"&ayid="+JSON.parse(cmbAcadamicYear.value).id,"GET");
            console.log(regcount)
            console.log(reglist)
            var studdetai = "";
            if(reglist.length != 0){
                studdetai = studdetai + JSON.parse(cmbStudentId.value).cname +" have "+ reglist.length +" cousins.\n ";
                txtTotalfee.value = 0.00;
            for(var index in reglist){
                    studdetai =  studdetai +  parseInt(index) + 1
                        +" Index No is : "+reglist[index][1] + ". Student Name is : " +reglist[index][2] + ". He is in " + reglist[index][3] + " class room.\n"

            }
            console.log(studdetai)
            txtDescription.value = studdetai;
            }
        }

        //year eken fees bind kirima
        function cmbAcadamicYearCH(){

            txtAcadamicfee.value = toDecimal(JSON.parse(cmbAcadamicYear.value).acadamicfee,2);
            txtAcadamicfee.style.border = valid;
            studentreg.acadamicfee = txtAcadamicfee.value;

            txtSocietyfee.value = toDecimal(JSON.parse(cmbAcadamicYear.value).societyfee,2);
            txtSocietyfee.style.border = valid;
            studentreg.societyfee = txtSocietyfee.value;

            txtTotalfee.value = toDecimal(JSON.parse(cmbAcadamicYear.value).studentfee,2);
            txtTotalfee.style.border = valid;
            studentreg.totalfee = txtTotalfee.value;

            if(studentreg.acadamicyear_id.name != null){
                cmbGrade.disabled = false;
            }else {
                cmbGrade.disabled = true;
            }

        }


        function cmbClassroomIdCH(){

            classroombygrade = httpRequest("/classroom/listbyyeargrade?yearid="+JSON.parse(cmbAcadamicYear.value).id+"&gradeid="+JSON.parse(cmbGrade.value).id, "GET");
            fillCombo(cmbClassroomname,"",classroombygrade,"name", "");

            if(studentreg.grade_id.name != null){
                cmbClassroomname.disabled = false;
            }else {
                cmbClassroomname.disabled = true;
            }

            subjectlistbygrade = httpRequest("/subjectdetail/listbystream?streamid="+JSON.parse(cmbGrade.value).stream_id.id, "GET");

            for (var index in subjectlistbygrade){
                var studentregistrationHasSubject = new Object();
                studentregistrationHasSubject.subjectdetail_id = subjectlistbygrade[index];
                studentregistrationHasSubject.first_term_result = 0;
                studentregistrationHasSubject.second_term_result = 0;
                studentregistrationHasSubject.third_term_result = 0;
                studentreg.studentHasReportcardList.push(studentregistrationHasSubject);
            }

        }


        function cmbSudentsIdCH(){

          /*  studentbyclassroom = httpRequest("/student/listbyclassroom?classroomid="+JSON.parse(cmbClassroomname.value).id, "GET");
            fillCombo3(cmbStudentId,"Select Student Name",studentbyclassroom,"cname", "regno","");
*/
            if(studentreg.classroom_id.name != null){
                cmbStudentId.disabled = false;
            }else {
                cmbStudentId.disabled = true;
            }
        }

        function loadForm() {
            studentreg = new Object();
            oldstudentreg = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            studentreg.studentHasReportcardList = new Array();

            //fill data in to combo box
            fillCombo(cmbAcadamicYear,"Select Year",acadamicyears,"name","");
            fillCombo(cmbGrade,"Select Grade",grades,"name", "");
            fillCombo(cmbClassroomname,"Select Classroom",classrooms,"name", "");
            fillCombo3(cmbStudentId,"Select Student",students,"regno","cname","");

            //fill and auto select , auto bind
            fillCombo(cmbStudentRegStatus,"",registrationstatus,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //convert to string
            studentreg.studentregstatus_id=JSON.parse(cmbStudentRegStatus.value);
            cmbStudentRegStatus.disabled = true;

            studentreg.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAsignDate.value=today.getFullYear()+"-"+month+"-"+date;
            studentreg.addeddate=dteAsignDate.value;
            dteAsignDate.disabled = true;

            //load wenakota disable
            cmbGrade.disabled = true;
            cmbClassroomname.disabled = true;
         //   cmbStudentId.disabled = true;

            //load wenakota text field empty
            txtAcadamicfee.value = "";
            txtSocietyfee.value = "";
            txtTotalfee.value = "";
            txtDescription.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            dteAsignDate.style.border=valid;
            cmbStudentRegStatus.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);
        }

        function setStyle(style) {

            $("#selectcStudent .select2-container").css('border', style);
            cmbAcadamicYear.style.border = style;
            cmbGrade.style.border = style;
            cmbStudentId.style.border = style;
            cmbClassroomname.style.border = style;
            txtTotalfee.style.border = style;
            txtSocietyfee.style.border = style;
            txtAcadamicfee.style.border = style;
            txtDescription.style.border = style;

            dteAsignDate.style.border = style;

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
            for(index in studenregs){
                if(studenregs[index].studentregstatus_id.name =="Deleted"){
                    tblstudentreg.children[1].children[index].style.color = "#f00";
                    tblstudentreg.children[1].children[index].style.border = "2px solid red";
                    tblstudentreg.children[1].children[index].lastChild.children[1].disabled = true;
                    tblstudentreg.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";

                }
            }

        }

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (studentreg.grade_id == null)
                errors = errors + "\n" + "Grade is Not Selected";
            else  addvalue = 1;

            if (studentreg.student_id == null)
                errors = errors + "\n" + "Student is Not Selected";
            else  addvalue = 1;

            if (studentreg.classroom_id == null)
                errors = errors + "\n" + "Classroom is Not Selected";
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
                    "\nAcadamic Year : " + studentreg.acadamicyear_id.name +
                    "\nGrade: " + studentreg.grade_id.name +
                    "\nStudent Name: " + studentreg.student_id.cname +
                    "\nClassroom : " + studentreg.classroom_id.name +
                    "\nTotal Fees : " + studentreg.totalfee,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/studentregistration", "POST", studentreg);
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

        function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();

            if(oldstudentreg == null && addvalue == ""){
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

        function fillForm(stureg,rowno){
            activerowno = rowno;

            if (oldstudentreg==null) {        //edit karanna kalin object eka
                filldata(stureg);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(stureg);
                    }

                });
            }
        }

        //when updating refill data into form
        function filldata(stureg) {
            clearSelection(tblstudentreg);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblstudentreg,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            studentreg = JSON.parse(JSON.stringify(stureg));
            oldstudentreg = JSON.parse(JSON.stringify(stureg));

            txtDescription.value = studentreg.description;
            txtAcadamicfee.value = studentreg.acadamicfee;
            txtSocietyfee.value = studentreg.societyfee;
            txtTotalfee.value = studentreg.totalfee;

            //fill combo predefine functtion ekak
            //fill data in to combo box
            fillCombo(cmbAcadamicYear,"",acadamicyears,"name",studentreg.acadamicyear_id.name);
            cmbAcadamicYearCH();

            fillCombo(cmbGrade,"",grades,"name", studentreg.grade_id.name);
            cmbGrade.disabled = true;

            fillCombo3(cmbStudentId,"",students,"regno","cname",studentreg.student_id.regno);
           /* cmbStudentId.disabled = false;*/
            cmbStudentIdCH();

            fillCombo(cmbClassroomname,"",classrooms,"name", studentreg.classroom_id.name);
            cmbClassroomname.disabled = false;
          //  cmbClassroomIdCH();

            //fill and auto select , auto bind
            fillCombo(cmbStudentRegStatus,"",registrationstatus,"name",studentreg.studentregstatus_id.name);
            cmbStudentRegStatus.disabled = false;             //update ekedith disable

            fillCombo(cmbAddedBy,"",employees,"callingname",studentreg.employee_id.callingname);

            disableButtons(true, false, false);
            setStyle(valid);
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(studentreg.description == null) txtDescription.style.border = initial;


        }

        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(studentreg!=null && oldstudentreg!=null) {

                if (studentreg.acadamicyear_id.name != oldstudentreg.acadamicyear_id.name)
                    updates = updates + "\nYear is Changed " + studentreg.acadamicyear_id.name + " into " + studentreg.acadamicyear_id.cname;

                if (studentreg.grade_id.name != oldstudentreg.grade_id.name)
                    updates = updates + "\nGrade is Changed " + studentreg.grade_id.name + " into " + studentreg.grade_id.name;

                if (studentreg.student_id.cname != oldstudentreg.student_id.cname)
                    updates = updates + "\nStudent is Changed " + studentreg.student_id.cname + " into " + studentreg.student_id.cname;

                if (studentreg.classroom_id.name != oldstudentreg.classroom_id.name)
                    updates = updates + "\nClassroom is Changed " + studentreg.classroom_id.name + " into " + oldstudentreg.classroom_id.name;

                if (studentreg.description != oldstudentreg.description)
                    updates = updates + "\nDescription is Changed " + studentreg.description + " into " + oldstudentreg.description;

                if (studentreg.studentregstatus_id.name != oldstudentreg.studentregstatus_id.name)
                    updates = updates + "\nStatus is Changed " + studentreg.studentregstatus_id.name + " into " + oldstudentreg.studentregstatus_id.name;

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
                        title: "Are you sure to update following student registrstion details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/studentregistration", "PUT", studentreg);
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

        function btnDeleteMC(stureg) {
            studentreg = JSON.parse(JSON.stringify(stureg));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following registration?",
                text:
                    "\n Student Name : " + studentreg.student_id.cname +
                    "\n Reg No : " + studentreg.student_id.regno +
                    "\n Total Fees : " + studentreg.totalfee,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/studentregistration","DELETE", studentreg);
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

        //*************
        function btnSearchClearMC(){
               loadView();
        }

        //table print
       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblstudentreg.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Student Registration Details </h1></div>" +
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



