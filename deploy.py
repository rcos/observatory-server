import subprocess
import sys

def build():
    print "Building Observatory distribution"    
    grunt_status = subprocess.call(['grunt', 'build'])
    return grunt_status

def copyToRemote(remoteLocation = 'root@127.0.0.1'):
    print "Removing temp build files from remote"
    remove_status = subprocess.call(['ssh', remoteLocation, 'rm -r /opt/temp']) 
    # Exit copying if removing the 'opt/temp' directory failed
    # if remove_status:
    #     print "Error: Could not remove '/opt/temp' on server"
    #     return remove_status
    print "Copying build files to remote"
    remote_path = remoteLocation + ':/opt/temp'
    print " Remote:", remote_path
    scp_status = subprocess.call(['scp', '-r', './dist/', remote_path]) 
    return scp_status

def updateServer(remoteLocation = 'root@127.0.0.1'):
    print "Updating Observatory"
    print " Remote:", remoteLocation 
    update_status = subprocess.call(['ssh', remoteLocation, './update.sh']) 
    return update_status

def deploy():
    '''
    Does everything needed to deploy the new server
    '''
    if build():
        print "Error building Observatory"
        sys.exit(1)
    else:
        print "Successfully built Observatory"

    if copyToRemote('observatory'):
        print "Error copying to remote"
        sys.exit(1)
    else:
        print "Successfully copied files to remote"
    
    if updateServer('observatory'):
        print "Error updating remote"
    else:
        print "Successfully updated remote."

def rollback():
    '''
    Does everything needed to roll back the server to the previous build
    '''
    rollback_check = raw_input('Are you sure you want to roll back? (Y/N)')
    while rollback_check.lower() not in ['y','n']:
        rollback_check = raw_input('Roll back? (Y/N)')
    
    if rollback_check == 'n':
        return 1

    remoteLocation = 'observatory'
    print "Rolling back Observatory"
    print " Remote:", remoteLocation
    rollback_output = subprocess.check_output(['ssh', remoteLocation, './rollback.sh'])
    print rollback_output,
    return 0

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "The deploy script takes arguments as follows: "
        print "  'python deploy.py action'"
        print " Where 'action' is: \n   update\n   rollback"
        sys.exit(1)
    else:
        if sys.argv[1] == "update":
            deploy()
        elif sys.argv[1] == "rollback":
            rollback()

