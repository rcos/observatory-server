import requests
import os
from datetime import datetime

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
            commit = {}
            commit['url'] = com['url']
            commit['sha'] = com['sha']
            commit['message'] = com['commit']['message']
            commit['author'] = {}
            if com['author']:
                commit['author']['login'] = com['author']['login']
                commit['author']['id'] = com['author']['id']
            commit['date'] = com['commit']['committer']['date']
            user = db.users.find_one({'githubLogin': commit['author']['login']})

            if user:
                userId = user['_id']
                print ObjectId(user['_id'])
                commit['userId'] = str(ObjectId(user['_id']))

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


if __name__ == '__main__':
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
