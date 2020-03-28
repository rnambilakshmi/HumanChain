pragma solidity >=0.5.0 <0.7.0;

contract HelpingHand{
    
    struct Cause{
        uint256 id;
        address creator;
        uint256 requirement;
        uint256 donated;
        uint256 withdrawn;
    }
    
    mapping(uint256 => bool) cause_exists;
    mapping(uint256 => bool) cause_fulfilled;
    mapping(uint256 => Cause) causes;
    
    uint256 counter = 0;
    address public owner;
    
    event NewCause(uint256 indexed id, address indexed creator, uint256 indexed req);
    event DonationMade(uint256 indexed id, address indexed donor, uint256 indexed amt);
    event DonationWithdrawn(uint256 indexed id);
    event VolunteerTipped(address volunteer, address sender, uint256 amt);
    
    
    constructor() public {
        owner = msg.sender;
    }

    function createCause(uint256 _req) public returns (uint256){
        counter++;
        cause_exists[counter] = true;
        causes[counter] = Cause({id: counter, creator: msg.sender, requirement: _req, donated: 0, withdrawn: 0});
        
        emit NewCause(counter, msg.sender, _req);
        return counter;
    }
    
    function donate(uint256 _id) public payable{
        require(msg.value != 0, "Can't donate 0 ETH");
        require(cause_exists[_id], "Cause for donation does not exist");
        require(!cause_fulfilled[_id], "Cause for donation has already been fulfilled");
        
        causes[_id].donated += msg.value;
        
        emit DonationMade(_id, msg.sender, msg.value);
    }
    
    function withdraw(uint256 _id) public {
        require(cause_exists[_id], "Cause for donation does not exist");
        require(!cause_fulfilled[_id], "Cause for donation has already been fulfilled");
        require(msg.sender == causes[_id].creator, "Only creator of cause can withdraw");
        

        msg.sender.transfer(causes[_id].donated - causes[_id].withdrawn);
        causes[_id].withdrawn = causes[_id].donated;
        
        if(causes[_id].donated == causes[_id].requirement){
            cause_fulfilled[_id] = true;
        }
        
        emit DonationWithdrawn(_id);
    }
    
    function tip(address payable _receiver) public payable{
        require(msg.value != 0, "Can't tip 0 ETH");
        _receiver.transfer(msg.value);
        
        emit VolunteerTipped(_receiver, msg.sender, msg.value);
    }

    function getCauseDetails(uint256 _id) public view returns(address, uint256, uint256, uint256, bool){
        require(cause_exists[_id], "Cause does not exist");
        Cause memory c = causes[_id];
        return (c.creator, c.requirement, c.donated, c.withdrawn, cause_fulfilled[_id]);
    }
}