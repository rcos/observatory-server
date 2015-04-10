import requests
import os
from datetime import datetime
import dateutil.parser
import re

from pymongo import MongoClient
from bson.objectid import ObjectId

MONGO_URL = 'mongodb://localhost/'

HOST = 'https://api.github.com'
PAYLOAD = {'client_id': os.environ['GITHUBCLIENTID'],
    'client_secret': os.environ['GITHUBCLIENTSECRET'],
    'per_page': 100}
headers = {'content-type': 'application/json'}

client = MongoClient(MONGO_URL)
db = client['observatory3-dev']

def parseCommit(commitData):
    '''Parses a commit from the Github URL'''
    commit = {}

    commit['url'] = commitData['url']
    commit['sha'] = commitData['sha']
    commit['message'] = commitData['commit']['message']
    commit['author'] = {}
    if commitData['author']:
        commit['author']['login'] = commitData['author']['login']
        commit['author']['id'] = commitData['author']['id']
    commit['date'] = dateutil.parser.parse(commitData['commit']['committer']['date'])

    projectUrl = commitData['html_url']
    projectUrl = projectUrl.split('/')

    username = projectUrl[3]
    projectName = projectUrl[4]
    print username, projectName,
    project = db.projects.find_one({'githubUsername': re.compile(username, re.IGNORECASE), 'githubProjectName': re.compile(projectName, re.IGNORECASE)})
    if project:
        commit['projectId'] = str(project['_id'])
        print  str(project['_id'])

    else:
        print
        commit['projectId'] = ''

    user = db.users.find_one({'github.login': commit['author']['login']})
    if user:
        userId = user['_id']
        commit['userId'] = str(ObjectId(user['_id']))

    return commit

def getCommits(userName, repositoryName, since=None):
    if since:
        # Add the last checked date to the parameters if it is available.
        PAYLOAD['since'] = since
    else:
        PAYLOAD['since'] = None
    # form the initial API URL
    path = HOST + '/repos/%s/%s/commits'%(userName, repositoryName)
    Commits = db.commits
    commits = []

    #While there are still pages of new commits keep getting commits
    while True:
        r = requests.get(path, params=PAYLOAD, headers=headers)
        commitsData = r.json()

        for com in commitsData:
            commit = parseCommit(com)

            if not len(list(Commits.find({'sha': commit['sha']}))):
                Commits.insert(commit, {'upsert':True})
            commits.append(commit)
        try:
            links = r.headers['link']
            links = links.split(',')
            for link in links:
                link = link.split(';')
                if 'next' in link[1]:
                    newPath = link[0][1:len(link[0])-1]
            if newPath == path:
                break
            else:
                path = newPath
        except:
            break

    print "Found %d new commit(s) for project %s %s since %s"%(
            len(commits), userName, repositoryName, str(since))
    return commits

def getUserEvents(user):
    Commits = db.commits
    path = HOST + '/users/%s/events/public'%(user['github']['login'])
    events = []
    r = requests.get(path, params=PAYLOAD, headers=headers)
    eventData = r.json()

    for event in eventData:
        try:
            if event['type'] == 'PushEvent':
                # User pushed code
                for com in event['payload']['commits']:
                    commit = {}

                    dbCommit = db.commits.find_one({'sha': com['sha']})

                    if not dbCommit:
                        # Ensure commit isn't already in our database before making a new one
                        r = requests.get(com['url'], params=PAYLOAD, headers=headers)
                        data =  r.json()
                        if 'message' in data:
                            # Message means that there was an error finding the commit
                            pass
                        else:
                            githubCommit = parseCommit(data)

                            Commits.insert(githubCommit,{'upsert':True})
            elif event['type'] == 'IssueCommentEvent':
                # User commented on an issue
                newEvent = {}
                newEvent['type'] = 'IssueCommentEvent'
                newEvent['action'] = event['payload']['action']
                newEvent['message'] = event['payload']['comment']['body']
                newEvent['url'] = event['payload']['comment']['html_url']
                newEvent['date'] = dateutil.parser.parse(event['payload']['comment']['created_at'])

                events.append(newEvent)
            elif event['type'] == 'PullRequestEvent':
                # Events that are pull requests
                newEvent = {}
                newEvent['type'] = 'PullRequestEvent'
                newEvent['action'] = event['payload']['action']
                newEvent['message'] = event['payload']['pull_request']['title']
                newEvent['url'] = event['payload']['pull_request']['_links']['html']['href']
                # Changes behavior based on whether the pull request was opened or closed
                if newEvent['action'] == 'closed':
                    newEvent['date'] = dateutil.parser.parse(event['payload']['pull_request']['closed_at'])
                elif newEvent['action'] == 'opened':
                    newEvent['date'] = dateutil.parser.parse(event['payload']['pull_request']['created_at'])

                events.append(newEvent)
            elif event['type'] == 'IssuesEvent':
                # IssuesEvent processing
                newEvent = {}
                newEvent['type'] = 'PullRequestEvent'
                newEvent['action'] = event['payload']['action']
                newEvent['message'] = event['payload']['issue']['body']
                newEvent['url'] = event['payload']['issue']['html_url']
                # Changes behavior based on whether the issue was opened or closed
                if newEvent['action'] == 'closed':
                    newEvent['date'] = dateutil.parser.parse(event['payload']['issue']['closed_at'])
                elif newEvent['action'] == 'opened':
                    newEvent['date'] = dateutil.parser.parse(event['payload']['issue']['created_at'])

                events.append(newEvent)
            elif event['type'] == 'CreateEvent':
                # CreateEvent ignored
                pass
            elif event['type'] == 'WatchEvent':
                # WatchEvent ignored
                pass
            elif event['type'] == 'ForkEvent':
                # ForkEvent ignored
                pass
            elif event['type'] == 'CommitCommentEvent':
                # CommitCommentEvent ignored
                pass
            else:
                print event['type']

        except:
            pass
    for event in events:
        db.users.update({'_id': user['_id']}, {'$addToSet':{'github.events': event}}, multi=False)

def createUser(name, username):
    user = {
        'name': name,
        'active': True,
        'github': {
            'events': [],
            'login': username,
            }
        }
    Users = db.users
    user_id = db.users.insert(user)
    print user_id
    return user_id

def getProjectCollaborators(owner, projectName):
    path = HOST + '/repos/%s/%s/commits'%(owner, projectName)

    users = {}
    count = 0
    while True:
        r = requests.get(path, params=PAYLOAD, headers=headers)
        commitsData = r.json()

        for comData in commitsData:
            count += 1
            if comData['author']:

                login =  comData['author']['login']
                name = comData['commit']['author']['name']
                users[login] = name
                # name = comData['commit']['author']
                # login = ''
                # if comData and 'committer' in comData.keys() and 'login' in comData['committer'].keys():
                #     login = comData['committer']['login']
                # print login, name
                # users.append((name, login))
        try:
            links = r.headers['link']
            links = links.split(',')
            for link in links:
                link = link.split(';')
                if 'next' in link[1]:
                    newPath = link[0][1:len(link[0])-1]
            if newPath == path:
                break
            else:
                path = newPath
        except:
            break
    users = [(users[key], key) for key in users.keys()]
    print list(users)
    print len(list(users))
    for name, username in users:
        print name + ',' + username
    print count

def updateUser(user):
    getUserEvents(user)

if __name__ == '__main__':
    users = db.users.find({'github.login': {'$exists': True}})
    for user in users:
        print "Fetching info for user: " + str(user['name'])
        updateUser(user)

    for project in db.projects.find({}):
        if project['repositoryType'] == 'github':
            userName = project['githubUsername']
            projectName = project['githubProjectName']

            if 'lastChecked' in project:
                since = project['lastChecked']
                getCommits(userName, projectName, since)
            else:
                getCommits(userName, projectName)
        db.projects.update({'_id': project['_id']},{'$set':{'lastChecked': datetime.now()}})
