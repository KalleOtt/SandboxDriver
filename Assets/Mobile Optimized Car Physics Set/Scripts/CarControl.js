//2016 Spyblood Productions
//Use for non-commerical games only. do not sell comercially
//without permission first
#pragma strict
@script RequireComponent(typeof(AudioSource))
var wheels : WheelCollider[] = new WheelCollider[4];
var tires : GameObject[] = new GameObject[4];
var centerOfGravity : Vector3;
var gasPedal : GUITexture;
var brakePedal : GUITexture;
var leftPedal : GUITexture;
var rightPedal : GUITexture;
var maxTorque : float = 1000;
var maxReverseTorque : float = 500;
var maxSteer : float = 25;
var decellarationRate : float = 10;
var mobileInput : boolean = false;
var GearRatio : float[];
private var throttleInput : int;
private var currentSpeed : float;
var maxSpeed : float = 150;
var gear : int;

private var dragStartVelocity : float;
private var dragMaxVelocity : float;
var maxDrag : float = 1.0;
private var maxVelocity : float;
private var originalDrag : float;
private var rb : Rigidbody;
// Cached values used in FixedUpdate
private var sqrDragStartVelocity : float;
private var sqrDragVelocityRange : float;
private var sqrMaxVelocity : float;

function Start () {
//find all the GUITextures from the scene and assign them
gasPedal = GameObject.Find("GasPedal").GetComponent.<GUITexture>();
brakePedal = GameObject.Find("BrakePedal").GetComponent.<GUITexture>();
leftPedal = GameObject.Find("LeftPedal").GetComponent.<GUITexture>();
rightPedal = GameObject.Find("RightPedal").GetComponent.<GUITexture>();
//Alter the center of mass for stability on your car
GetComponent.<Rigidbody>().centerOfMass = centerOfGravity;
}
function Awake(){
//Awake is called before start so it's useful for caching data
dragStartVelocity = maxSpeed / 2;
dragMaxVelocity = maxSpeed / 2;
maxVelocity = maxSpeed / 2;
	originalDrag = GetComponent.<Rigidbody>().drag;
	rb = GetComponent.<Rigidbody>();
	Initialize(dragStartVelocity, dragMaxVelocity, maxSpeed, maxDrag);
}
function Initialize(dragStartVelocity : float, dragMaxVelocity : float, maxVelocity : float, maxDrag : float){
	this.dragStartVelocity = dragStartVelocity;
	this.dragMaxVelocity = dragMaxVelocity;
	this.maxVelocity = maxVelocity;
	this.maxDrag = maxDrag;

	// Calculate cached values
	sqrDragStartVelocity = dragStartVelocity * dragStartVelocity;
	sqrDragVelocityRange = (dragMaxVelocity * dragMaxVelocity) - sqrDragStartVelocity;
	sqrMaxVelocity = maxVelocity * maxVelocity;
}
function FixedUpdate () {
//its best to call custom functions from Fixedupdate so gameplay is smooth.
//this is especially good for mobile development because the controls
//become unresponsive in standard Update (At least that's what I experienced)
DriveMobile();
Drive();
EngineSound();
CalculateSpeed();
CapSpeed();
AllignWheels();
}
function AllignWheels()
{
         for (var i = 0; i < 4; i++)
            {
                var quat : Quaternion;
                var position : Vector3;
                wheels[i].GetWorldPose(position,quat);
                tires[i].transform.position = position;
                tires[i].transform.rotation = quat;
                
            }
}
function CapSpeed()
{
	var v = rb.velocity;
	// We use sqrMagnitude instead of magnitude for performance reasons.
	var vSqr = v.sqrMagnitude;

	if(vSqr > sqrDragStartVelocity){
		GetComponent.<Rigidbody>().drag = Mathf.Lerp(originalDrag, maxDrag, Mathf.Clamp01((vSqr - sqrDragStartVelocity)/sqrDragVelocityRange));

		// Clamp the velocity, if necessary
		if(vSqr > sqrMaxVelocity){
			rb.velocity = v.normalized * maxVelocity;
		}
	} else {
		rb.drag = originalDrag;
	}
}
function CalculateSpeed()
{
currentSpeed = GetComponent.<Rigidbody>().velocity.magnitude * 2;
currentSpeed = Mathf.Round(currentSpeed);
}
function DriveMobile(){

if (!mobileInput)
{
return;
//dont call this code at all unless the mobileInput box is checked in the editor
}
for (var touch : Touch in Input.touches){
				//if the gas button is pressed down, speed up the car.
				if (touch.phase == TouchPhase.Stationary && gasPedal.HitTest(touch.position))
				{
					throttleInput = 1;
					wheels[0].motorTorque = maxTorque * throttleInput;
					wheels[1].motorTorque = maxTorque * throttleInput;
					wheels[2].motorTorque = maxTorque * throttleInput;
					wheels[3].motorTorque = maxTorque * throttleInput;
					
					wheels[0].brakeTorque = 0;
					wheels[1].brakeTorque = 0;
					wheels[2].brakeTorque = 0;
					wheels[3].brakeTorque = 0;
				}
				//when the gas button is released, slow the car down
			else if (touch.phase == TouchPhase.Ended && gasPedal.HitTest)
				{
					throttleInput = 0;
					wheels[0].motorTorque =0;
					wheels[1].motorTorque =0;
					wheels[2].motorTorque =0;
					wheels[3].motorTorque =0;
					
					wheels[0].brakeTorque = decellarationRate;
					wheels[1].brakeTorque = decellarationRate;
					wheels[2].brakeTorque = decellarationRate;
					wheels[3].brakeTorque = decellarationRate;
				}
				//now the same thing for the brakes
			if (touch.phase == TouchPhase.Stationary && brakePedal.HitTest(touch.position))
				{
					throttleInput = -1;
					wheels[0].motorTorque = maxTorque * throttleInput;
					wheels[1].motorTorque = maxTorque * throttleInput;
					wheels[2].motorTorque = maxTorque * throttleInput;
					wheels[3].motorTorque = maxTorque * throttleInput;
					
					wheels[0].brakeTorque = 0;
					wheels[1].brakeTorque = 0;
					wheels[2].brakeTorque = 0;
					wheels[3].brakeTorque = 0;
				}
				//stop braking once you put your finger off the brake pedal
			else if (touch.phase == TouchPhase.Ended && brakePedal.HitTest)
				{
					throttleInput = 0;
					wheels[0].motorTorque =0;
					wheels[1].motorTorque =0;
					wheels[2].motorTorque =0;
					wheels[3].motorTorque =0;
					
					wheels[0].brakeTorque = decellarationRate;
					wheels[1].brakeTorque = decellarationRate;
					wheels[2].brakeTorque = decellarationRate;
					wheels[3].brakeTorque = decellarationRate;
				}
				//now the left steering column...
				if (touch.phase == TouchPhase.Stationary && leftPedal.HitTest(touch.position))
				{
					//turn the front left wheels according to input direction
					wheels[0].steerAngle = -maxSteer;
					wheels[1].steerAngle = -maxSteer;
				}
				//and stop the steering once you take your finger off the turn button
				else if (touch.phase == TouchPhase.Ended && leftPedal.HitTest)
				{
					wheels[0].steerAngle = 0;
					wheels[1].steerAngle = 0;
				}
				//now the right steering column...
				if (touch.phase == TouchPhase.Stationary && rightPedal.HitTest(touch.position))
				{
					//turn the front left wheels according to input direction
					wheels[0].steerAngle = maxSteer;
					wheels[1].steerAngle = maxSteer;
				}
				//and stop the steering once you take your finger off the turn button
				else if (touch.phase == TouchPhase.Ended && rightPedal.HitTest)
				{
					wheels[0].steerAngle = 0;
					wheels[1].steerAngle = 0;
				}
		}
}
function Drive(){
//this function is called for the desktop gameplay
if (mobileInput)
{
return;
}
//the car will be 4 wheel drive or else it will be slow or feel a little sluggish
//no matter how much you increase the max torque.

wheels[0].motorTorque = maxTorque * Input.GetAxis("Vertical");
wheels[1].motorTorque = maxTorque * Input.GetAxis("Vertical");
wheels[2].motorTorque = maxTorque * Input.GetAxis("Vertical");
wheels[3].motorTorque = maxTorque * Input.GetAxis("Vertical");

wheels[0].steerAngle = maxSteer * Input.GetAxis("Horizontal");
wheels[1].steerAngle = maxSteer * Input.GetAxis("Horizontal");
//slow down the car once the throttle is released.

if (Input.GetAxis("Vertical")<0 && wheels[0].rpm < 0)
{
//reverse speed
					wheels[0].motorTorque = -maxReverseTorque;
					wheels[1].motorTorque = -maxReverseTorque;
					wheels[2].motorTorque = -maxReverseTorque;
					wheels[3].motorTorque = -maxReverseTorque;
}

}
function EngineSound()
{
//the function called to give the car basic audio, as well as some gear shifting effects
//it's prefered you use the engine sound included, but you can use your own if you have one.
//~~~~~~~~~~~~[IMPORTANT]~~~~~~~~~~~~~~~~
//make sure your last gear value is higher than the max speed variable or else you will
//get unwanted errors!!

//anyway, let's get started

for (var i = 0; i < GearRatio.Length; i++)
{
if (GearRatio[i] > currentSpeed)
{
//break this value
break;
}
}
var minGearValue = 0.00;
var maxGearValue = 0.00;
if (i == 0)
{
minGearValue = 0;
}
else{
minGearValue = GearRatio[i-1];
}
maxGearValue = GearRatio[i];
//the pitch to start out with
var pitch : float = ((currentSpeed - minGearValue)/(maxGearValue - minGearValue) + 0.8);
GetComponent.<AudioSource>().pitch = pitch;
gear = i;
}
function OnGUI()
{
//show the GUI for the speed and gear we are on.
GUI.Box(Rect(10,10,70,30),"MPH: " + Mathf.Round(GetComponent.<Rigidbody>().velocity.magnitude * 2.6));
GUI.Box(Rect(10,70,70,30),"Gear: " + gear);
}