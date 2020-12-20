document.addEventListener('DOMContentLoaded', function() {

// Use buttons to toggle between views
document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
document.querySelector('#compose').addEventListener('click', compose_email);
// By default, load the inbox
load_mailbox('inbox');
});

function compose_email(rep) {
   // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-email').style.display = 'none';
  //This will clear existing values in the input fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  //////////Compose email code starts here/////////////////
  ////////this part of compose code will run only if its a reply to any email////////////////
  if(Number.isInteger(rep))//we check here if the id of the button clicked returns an integer , this integer is the emails ID
{
	const url = `/emails/${rep}`;
	fetch(url)
	.then(response => response.json())
	.then(email => {
		document.querySelector("#compose-recipients").value= `${email["sender"]}`;
		if(email["subject"].search("Re:") >= 0)//here we check if RE: is already present in the subject of the email
        {var subject = email["subject"].replace('Re:','');//if RE: is present we replace by putting nothing there
        document.querySelector("#compose-subject").value= `Re: ${subject}`;}
        else
        {document.querySelector("#compose-subject").value= `Re: ${email["subject"]}`;}
////////////// body of replied mail starts here ////////////////////////////////
		document.querySelector("#compose-body").value=`

------------------------------------------------------------------------------------------------------------------------------------------------------------------------
On ${email["timestamp"]} ${email["sender"]}  wrote:
${email["body"]}`;
/////////////////// till here is the body of the replied mail //////////////////
});
}
  ////////////////////////////second part of compose code will run when you want to start typing a new mail///////////////////////////////////////////////
  document.querySelector('#compose-form').addEventListener('submit', functionsubmit);
  function functionsubmit() {
  event.preventDefault();
   fetch('emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value })
   }).then(response => response.json())
  .then(response => {
      console.log('Response: ', response);
  })
  ////////////Compose email code ends here/////////////////////////////////
  // Clear out composition fields
   document.querySelector('#compose-recipients').value = '';
   document.querySelector('#compose-subject').value = '';
   document.querySelector('#compose-body').value = '';
   load_mailbox('sent');
}
}
var x; //I have set this variable which will store in the value of mailbox from load_mailbox() function and we can use it in openmail() function
function load_mailbox(mailbox) {
  x = mailbox;
  const url = `/emails/${x}`;
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emailviewname').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
//Api that fetches inbox data
 fetch(url)
.then(response => response.json())
.then(emails => {
    var mainContainer = document.getElementById("emailcontent");
     document.querySelector("#emailcontent").innerHTML="";
     for (var i = 0; i < emails.length; i++) {
        var div = document.createElement("div");
		div.setAttribute("class", "container-md");
		if(x === "sent")//if mailbox is sent we need to show the names of the recipients rather than the sender which is emails[i]["recipients"]
		{
		div.innerHTML = `<button class="block" id=${emails[i]["id"]} onclick="openmail( this );color( this );">
                            <p style="float: left; width: 34%; text-align: left;"><b>${emails[i]["recipients"]}</b></p>
                            <p style="float: left; width: 33%; text-align: center;">${emails[i]["subject"]}</p>
                            <p style="float: left; width: 33%; text-align: right;">${emails[i]["timestamp"]}</p>
                         </button>`
		mainContainer.appendChild(div);

		}
		else
		{
        div.innerHTML = `<button class="block" id=${emails[i]["id"]} onclick="openmail( this );color( this );">
                            <p style="float: left; width: 30%; text-align: left;"><b>${emails[i]["sender"]}</b></p>
                            <p style="float: left; width: 40%; text-align: center;">${emails[i]["subject"]}</p>
                            <p style="float: left; width: 30%; text-align: right;">${emails[i]["timestamp"]}</p>
                         </button>`
        mainContainer.appendChild(div);
        }
        if(emails[i]["read"]===true)//Here if the email is read then we change the background colour of the button
        {
        var id = emails[i]["id"]
        document.getElementById(id).style.backgroundColor = "#d5e1df";
        }
        }


});
}

function openmail(id) //if any email is opened this function will run
{
var i = id.id;

document.querySelector('#emails-view').style.display = 'none';
document.querySelector('#compose-view').style.display = 'none';
document.querySelector('#read-email').style.display = 'block';
const url = `/emails/${i}`
fetch(url)
.then(response => response.json())
.then(email => {
    document.querySelector("#read-email").innerHTML="";
    document.querySelector("#read-email").innerHTML=`<h3><b>SUBJECT : ${email["subject"]}</b></h3>
                                                     <h6 align="right">TIME : ${email["timestamp"]}</h6>
                                                     <div class="container-md mt-3 border">FROM: ${email["sender"]}</div>
                                                     <div class="container-md mt-3 border">TO: ${email["recipients"]}</div><br>
                                                     <div class="container-md border"><pre>${email["body"]}</pre></div><br>
                                                     <button class="btn btn-primary" onclick="reply(${email["id"]});" id="reply">Reply</button> <button class="btn btn-secondary" id=${email["id"]} onclick="archived( this );" > </button>`;

      if(x==="sent")
      {
      document.querySelector(".btn.btn-secondary").style.visibility = 'hidden';//this will hide the archive button if you are viewing sent mailbox
      }
      else if(email["archived"]===true)
      {document.querySelector(".btn.btn-secondary").innerHTML= "Click here to Un-Archive";}
      else
      {document.querySelector(".btn.btn-secondary").innerHTML= "Click here to Archive";}
});
}

function color(id) //if any email is opened this function will run and it will set read = true so that next time when you see the email its background color will be changed
{
fetch(`/emails/${id.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})

}
function archived(id)//below function is run when you click the archive email button , it basically sets the archived = true and if its already true then it will set it to false
{
fetch(`/emails/${id.id}`).then(response => response.json())
.then(email => {
if(email["archived"] === true)
{
 fetch(`/emails/${id.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: false
  })
})
}
else
{
fetch(`/emails/${id.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
})
}
})
setTimeout(location.reload.bind(location), 500);//this will refresh the application after 500ms
}

function reply(id) // this will run if you click on reply button in an email nd this will call the compose_email function and pass the "rep" which has the id number of the email
{
var rep = id;
compose_email(rep)
}
