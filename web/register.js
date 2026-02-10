const signInButton=document.getElementById(SignIn)
const signUpButton=document.getElementById(SignUp)

signUpButton.addEventListener('click',function(){
    signInButton.style.display='none';
    signUpButton.style.display='block';
})
signInButton.addEventListener('click',function(){
    signInButton.style.display='block';
    signUpButton.style.display='none';
})
