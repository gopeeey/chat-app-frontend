import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputBase,
  IconButton,
  Toolbar,
  Button,
  Avatar,
  Slide
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import Badge from '../components/badge';
import clsx from 'clsx';
import socket from '../src/socket';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';



const useStyles = theme => ({
  root: {
    width: '100%',
    background: theme.palette.background.paper
  },
  aside: {
    height: '100vh',
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(4, 0, 0),
    transition: 'all 0.5s',
    [theme.breakpoints.down('xs')]: {
      position: 'absolute',
      zIndex: '2',
      width: '80%'
    }
  },
  hideAside: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(-1000)
    },
    
  },
  listItem: {
    paddingLeft: theme.spacing(3)
  },
  bold: {
    fontWeight: '600'
  },
  activeUser: {
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.background.paper
    },
    '& .username': {
      color: theme.palette.text.primary
    }
  },
  content: {
    height: '89vh',
    [theme.breakpoints.down('md')]: {
      height: '94vh'
    },
    [theme.breakpoints.down('xs')]: {
      height: '89vh'
    }
  },
  form: {
    height: '10vh',
    [theme.breakpoints.down('md')]: {
      height: '5vh'
    },
    [theme.breakpoints.down('xs')]: {
      height: '10vh'
    }

  },
  messageInput: {
    backgroundColor: theme.palette.background.paper,
    height: '100%',
    paddingLeft: theme.spacing(3),
    width: '93.6%',
    [theme.breakpoints.down('sm')]: {
      width: '85%'
    }
  },
  toolbar: {
    padding: theme.spacing(4),
    '& .username': {
      fontWeight: '600'
    },
  },
  loginRoot: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    '& button': {
      padding: '12px'
    }
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(4),
    '& h6': {
      marginLeft: theme.spacing(3)
    },
    '& .avatarName': {
      display: 'flex',
    alignItems: 'center',
    }
  },
  usernameInput: {
    backgroundColor: theme.palette.grey[300],
    marginRight: theme.spacing(1),
    padding: theme.spacing(1, 2),
    borderRadius: '0.3em'
  },
  userAvatar: {
    padding: theme.spacing(3),
    fontSize: '200%'
  },
  messageRoot: {
    display: 'flex',
    width: '100%',
    margin: theme.spacing(2, 0)
  },
  userMessageRoot: {
    justifyContent: 'flex-end'
  },
  messageBox: {
    padding: theme.spacing(2),
    borderRadius: '0.4em',
    backgroundColor: theme.palette.grey[300],
    maxWidth: '50%'
  },
  userMessageBox: {
    backgroundColor: theme.palette.primary.light,
    color: 'white'
  },
  chatArea: {
    padding: theme.spacing(1, 3),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: '100%'
  },
  chatAreaHolder: {
    [theme.breakpoints.down('md')]: {
      height: '85vh'
    },
    [theme.breakpoints.down('sm')]: {
      height: '83vh'
    },
    [theme.breakpoints.down('xs')]: {
      height: '71vh'
    },
    height: '71vh',
    overflow: 'auto',
  },
  menuIcon: {
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    },
    marginRight: theme.spacing(2)
  }
});


class Index extends React.Component {

  componentIsMounted = false;

  state = {
    asideOpen: true,
    userSelected: false,
    username: '',
    usernameInput: '',
    users: [],
    activeUser: null,
    currentUser: null,
    tempMessages: {}
  }

  componentDidMount () {
    this.componentIsMounted = true;
    this.startListeners();
    const username = localStorage.getItem('username');
    if (username) {
      this.changeState({
        username
      });
      socket.auth = {username}
      this.connectSocket();
    }
    
  }

  componentWillUnmount () {
    this.componentIsMounted = false;
  }

  changeState = (newState, callBack) => {
    this.setState(newState, callBack)
  }

handleLoginChange = (e) => {
  this.changeState({
usernameInput: e.target.value
  })
}


connectSocket = () => {
  const username = localStorage.getItem('username');
      if (username) {
        
        socket.auth = {...socket.auth, username};
        
      }
      socket.connect();
}

startListeners = () => {

  // session
  socket.on('session', ({username}) => {

    // attach username to next reconnection attempts
    socket.auth = {...socket.auth, username};
    this.changeState({
      userSelected: true
    });

    // store username in the local Storage
    localStorage.setItem('username', username)
    
    // save the username of the user
    socket.username = username;

  });
  // handle connection error
  socket.on('connect_error', (err) => {
    if (err.message === 'Invalid username') {
      this.changeState({
        username: ''
      });
    }
  });

  // receive and map existing users
  socket.on('users', (newUsers) => {
    const tempMessages = {};
    newUsers.forEach(user => {
      tempMessages[user.username] = '';
      user.newMessageCount = 0;
    });
    this.changeState({
      tempMessages,
      users: [...this.state.users, ...newUsers]
    });
  });

  // listen for and receive new user
  socket.on('newUser', (newUser) => {
    const exists = this.state.users.find(user => (user.username === newUser.username));
    if (exists) {
      const index = this.state.users.indexOf(exists);
      const newUsers = this.state.users;
      newUsers[index] = {
        ...exists,
        connected: true
      }
      this.changeState({
        users: newUsers
      })
    } else {
      const tempMessages = this.state.tempMessages;
    tempMessages[newUser.username] = ''
    this.changeState({
      users: [...this.state.users, {
        ...newUser,
        newMessageCount: 0
      }],
      tempMessages
    });
    }
    
  });

  // listen and receive this user's ID
  socket.on('self', (self) => {
    this.changeState({
      currentUser: self
    })
  });

  // get new message
  socket.on('private message', (message) => {

    // display the message under the correct sender
    const oldUser = this.state.users.find(
      existingUser => (
        existingUser.username === (message.from === this.state.currentUser.username ? (
          message.to
        ) : (message.from))
        )
      );
      if (oldUser) {
        const index = this.state.users.indexOf(oldUser);
     const newUsers = this.state.users;
     const newUser  = {
       ...oldUser,
       messages: [
         ...oldUser.messages,
         message
       ],
       newMessageCount: oldUser.newMessageCount + 1
     }
     newUsers[index] = newUser;
     const newState = {
       users: newUsers
     }

     // do not increase new message counter if 
     // the sender's chat is already open
     if (this.state.activeUser) {
       if (this.state.activeUser.username === newUser.username) {
         newState["activeUser"] = {...newUser, newMessageCount: 0};
         newUsers[index] = {...newUser, newMessageCount: 0};
         newState["users"] = newUsers;
       }
     }
     this.changeState(newState);
      }
     
  });

  // set connection status when users disconnect
  socket.on('disconnected', (discUsername) => {
    const discUser = this.state.users.find(user => (user.username === discUsername));
    if (discUser) {
      const index = this.state.users.indexOf(discUser);
      const newUsers = this.state.users;
      newUsers[index] = {
        ...discUser,
        connected: false
      }
      this.changeState({
        users: newUsers
      })
    }
    
  })
}


setActiveUser = (user) => {
  if (document) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.value = this.state.tempMessages[user.username];
    
  }

  const newUser = {
    ...user,
    newMessageCount: 0,

  }

  const newUsers = this.state.users;
  const index = newUsers.indexOf(user);
  newUsers[index] = newUser

  
  
  this.changeState({
    activeUser: newUser,
    users: newUsers,
    asideOpen: false
  });
}


handleLoginSubmit = (e) => {
  e.preventDefault();
  const usernameInput = this.state.usernameInput;
  if (usernameInput.length) {
      this.changeState({
        username: usernameInput
      });
      localStorage.setItem('username', usernameInput);
      socket.auth = {username: usernameInput}
      this.connectSocket();
  }
}


handleTypingChange = (e) => {
  
  this.changeState({
      tempMessages: {
        ...this.state.tempMessages, 
        [e.target.name]: e.target.value
      }
  });

}


handleMessageSubmit = (e) => {
  e.preventDefault();
  if (this.state.activeUser) {
    const message = {
      content: this.state.tempMessages[this.state.activeUser.username],
      to: this.state.activeUser.username
    }
    socket.emit('private message', message);
    if (document) {
      const chatBox = document.getElementById('chatInput');
      chatBox.value = '';
    }
    const tempMessages = {
      ...this.state.tempMessages,
      [this.state.activeUser.username]: ''
    }
    const user = {
      ...this.state.activeUser,
      messages: [
        ...this.state.activeUser.messages,
        {
          content: message.content,
          from: this.state.currentUser.username
        }
      ]
    }

    const oldUser = this.state.users.find(
      existingUser => (existingUser.username === this.state.activeUser.username)
      );
      const index = this.state.users.indexOf(oldUser);
      const newUserList = this.state.users;
      newUserList[index] = user;
    this.changeState({
      tempMessages,
      users: newUserList,
      activeUser: user
    }, () => {
      if (document) {
      const chatArea = document.getElementById('chatArea');
      chatArea.scrollTop = chatArea.scrollHeight;
    }
    });
    
  }
}

logout = () => {
    localStorage.removeItem('username');
    const originalState = {
      userSelected: false,
      username: '',
      usernameInput: '',
      users: [],
      activeUser: null,
      currentUser: null,
      tempMessages: {}
    }
    this.changeState(originalState);
    socket.disconnect();
    
}

render() {
  const {classes} = this.props;
  const {
    users,
    activeUser
  } = this.state;
  return (
    <div className={classes.root}>
      {
        !this.state.userSelected ? (
          <form className={classes.loginRoot} onSubmit={this.handleLoginSubmit}>
            <InputBase className={classes.usernameInput}
            placeholder="Username"
            onChange={this.handleLoginChange} />
            <Button variant="contained" color="primary"
            onClick={this.handleLoginSubmit}
            disableElevation>
              Login
            </Button>
          </form>
        ) : (
          <Grid container>
            {
                  <Grid item xs={10} sm={4} md={3} className={clsx(classes.aside, {
                    [classes.hideAside]: !this.state.asideOpen
                  })}>
        <div className={classes.userBox}>
          <div className="avatarName">
            <Avatar className={classes.userAvatar}>
                {this.state.username.slice(0, 1)}
              </Avatar>
              <Typography variant="h6" color="secondary" className={classes.bold}>
                {this.state.username}
              </Typography>
          </div>
              <IconButton color="secondary"
              onClick={this.logout}>
                <ExitToAppIcon color="inherit" />
              </IconButton>
            </div>
            {
              this.state.currentUser ? (
                <List>
              {
                users.filter(user => (user.username !== this.state.currentUser.username)).map(user => (
                  <ListItem key={user.username} button 
                  onClick={() => {
                    this.setActiveUser(user);
                  }}
                  className={clsx(classes.listItem, {
                    [classes.activeUser]: activeUser ? (user.username === activeUser.username) : (
                      false
                    )
                  })}>
                <ListItemText primary={<Typography variant="body1" 
                color="secondary" className={clsx(classes.bold, 'username')}>
                  {user.username}
                </Typography>}
                secondary={
                  <Typography variant="body2">
                    {user.connected? ('online') : ('offline')}
                  </Typography>
                } />

                {
                  Boolean(user.newMessageCount) ? (
                    <Badge visible={Boolean(user.newMessageCount)}
                    text={user.newMessageCount} />
                  ) : (null)
                }
                
              </ListItem>
                ))
              }
              
            </List>
              ) : (null)
            }
            
        </Grid>
            }
        
        {
          activeUser ? (
            <Grid item xs={12} sm={8} md={9} className={classes.main}>
            <div className={classes.content}>
              <div className={classes.stickyToolbar}>
                <Toolbar className={classes.toolbar}>
                  <IconButton className={classes.menuIcon}
                  onClick={
                    () => {
                      this.changeState({
                        asideOpen: !this.state.asideOpen
                      })
                    }
                  }>
                    <MenuIcon />
                  </IconButton>
                <Typography variant="h6" className='username'>
                  {activeUser.username}
                </Typography>
              </Toolbar>
              <Divider />
              </div>
              
              <div className={classes.chatAreaHolder} id="chatArea">
                <div className={classes.chatArea}>
                {
                  activeUser.messages.map((message, index) => (
                    <div key={index} className={clsx(classes.messageRoot, {
                      [classes.userMessageRoot]: message.from === this.state.currentUser.username
                    })}>
                      <div className={clsx(classes.messageBox, {
                        [classes.userMessageBox]: message.from === this.state.currentUser.username
                      })}>
                      {message.content}
                    </div>
                    </div>
                    
                  ))
                }
              </div>
              </div>
              
            </div>
            <Divider />
            <form className={classes.form} onSubmit={this.handleMessageSubmit}>
              <InputBase 
              id="chatInput"
              autoFocus
              defaultValue={this.state.tempMessages[activeUser.username]}
              className={classes.messageInput}
              name={activeUser.username}
              placeholder="Enter your message"
              onChange={this.handleTypingChange} 
              
              />
              <IconButton onClick={this.handleMessageSubmit}>
                <SendIcon />
              </IconButton>
              <input type="submit" style={{ display: "none" }} />
            </form>
        </Grid>
          ) : (null)
        }
      </Grid>
        )
      }
      
    </div>
  )
}


}

export default withStyles(useStyles)(Index);