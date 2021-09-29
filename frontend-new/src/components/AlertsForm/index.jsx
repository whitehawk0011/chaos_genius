import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Slack from '../../assets/images/alerts/slack.svg';
import Email from '../../assets/images/alerts/email.svg';
import Edit from '../../assets/images/disable-edit.svg';

import {
  getAllAlertEmail,
  getEditChannel,
  getEmailMetaInfo,
  getSlackMetaInfo
} from '../../redux/actions';

import { toastMessage } from '../../utils/toast-helper';

const AlertsForm = () => {
  const history = useHistory();

  const data = history.location.pathname.split('/');

  const {
    emailLoading,
    editLoading,
    emailData,
    editData,
    emailMetaInfoData,
    emailMetaInfoLoading,
    slackMetaInfoData,
    slackMetaInfoLoading
  } = useSelector((state) => {
    return state.alert;
  });

  const dispatch = useDispatch();
  const [slackEdit, setSlackEdit] = useState({
    webhook_url: true,
    channel_name: true
  });

  const [slackData, setSlackData] = useState({
    webhook_url: '',
    channel_name: ''
  });

  const [editedSlack, setEditedSlack] = useState({});
  const [sensitveSlack, setSensitveSlack] = useState({
    webhook_url: '',
    channel_name: ''
  });

  const [placeholderSlack, setPlaceHolderSlack] = useState({
    webhook_url: '',
    channel_name: ''
  });

  const [webhookUrlError, setWebhookUrlError] = useState(false);
  const [channelNameError, setChannelNameError] = useState(false);

  const [editedData, setEditedData] = useState({});

  const [email, setEmail] = useState({
    smtp: '',
    port: '',
    username: '',
    password: '',
    emailsender: ''
  });

  const [placeHolderEmail, setPlaceHolderEmail] = useState({
    username: '',
    password: ''
  });

  const [emailError, setEmailError] = useState({
    server: '',
    port: '',
    username: '',
    password: '',
    sender_email: ''
  });

  const [enabled, setEnabled] = useState({
    server: true,
    port: true,
    username: true,
    password: true,
    sender_email: true
  });

  const [sensitiveData, setSensitveData] = useState({
    server: '',
    port: '',
    username: '',
    password: '',
    sender_email: ''
  });

  useEffect(() => {
    if (data[4] === 'edit') {
      dispatch(getSlackMetaInfo());
      if (data[3] === 'slack') {
        dispatch(
          getEditChannel({
            config_name: 'slack'
          })
        );
      } else if (data[3] === 'email') {
        dispatch(getEmailMetaInfo());
        dispatch(
          getEditChannel({
            config_name: 'email'
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data[3] === 'email' && editData) {
      var obj = { ...email };
      obj['port'] = editData?.config_setting?.port || '';
      obj['sender_email'] = editData?.config_setting?.sender_email || '';
      obj['server'] = editData?.config_setting?.server || '';
      setEmail(obj);
      setPlaceHolderEmail({
        ...placeHolderEmail,
        username: editData?.config_setting?.username || '',
        password: editData?.config_setting?.password || ''
      });
    } else if (data[3] === 'slack' && editData) {
      setPlaceHolderSlack({
        ...placeholderSlack,
        webhook_url: editData?.config_setting?.webhook_url,
        channel_name: editData?.config_setting?.channel_name
      });
      // setSlackData({
      //   ...slackData,
      //   webhook_url: editData?.config_setting?.webhook_url,
      //   channel_name: editData?.config_setting?.channel_name
      // });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  useEffect(() => {
    if (emailData && emailData.status === 'success') {
      toastMessage({ type: 'success', message: 'Successfully updated' });
    } else if (emailData && emailData.status === 'failed') {
      toastMessage({ type: 'error', message: 'Failed to update' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailData]);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line
    return re.test(String(email).toLowerCase());
  };

  const alertHandler = () => {
    if (data[3] === 'email') {
      if (data[4] !== 'edit') {
        var objectErr = { ...emailError };
        if (email.smtp === '') {
          objectErr['server'] = 'Enter SMTP server';
        }
        if (email.port === '') {
          objectErr['port'] = 'Enter Port';
        }
        if (
          !(
            /^[1-9]\d*$/.test(email.port) &&
            1 <= 1 * email.port &&
            1 * email.port <= 65535
          ) &&
          email.port !== ''
        ) {
          objectErr['port'] = 'Enter Valid Port';
        }

        if (email.username === '') {
          objectErr['username'] = 'Enter Username';
        }
        if (email.password === '') {
          objectErr['password'] = 'Enter Password';
        }
        if (email.emailsender === '') {
          objectErr['sender_email'] = 'Enter Email';
        }
        if (email.emailsender !== '' && !validateEmail(email.emailsender)) {
          objectErr['sender_email'] = 'Enter Valid Email';
        }
        setEmailError(objectErr);
        if (
          objectErr.server === '' &&
          objectErr.port === '' &&
          objectErr.username === '' &&
          objectErr.password === '' &&
          objectErr.sender_email === ''
        ) {
          const data = {
            config_name: 'email',
            config_settings: {
              server: email.server,
              port: email.port,
              username: email.username,
              password: email.password,
              sender_email: email.sender_email
            }
          };
          dispatchGetAllAlertEmail(data);
        }
      } else {
        const data = {
          config_name: 'email',
          config_settings: editedData
        };
        dispatchGetAllAlertEmail(data);
      }
    } else if (data[3] === 'slack') {
      if (data[4] !== 'edit') {
        if (slackData.channel_name === '') {
          setChannelNameError(true);
        }
        if (slackData.webhook_url === '') {
          setWebhookUrlError(true);
        }
        if (
          slackData.webhook_url !== '' &&
          slackData.webhook_url !== null &&
          slackData.channel_name !== '' &&
          slackData.channel_name !== null
        ) {
          const payload = {
            config_name: 'slack',
            config_settings: slackData
          };
          dispatchGetAllAlertEmail(payload);
        }
      } else {
        const payload = {
          config_name: 'slack',
          config_settings: editedSlack
        };
        dispatchGetAllAlertEmail(payload);
      }
    }
  };

  const onChangeHandler = (e) => {
    const { name } = e.target;
    if (enabled[name]) {
      setEmail((prev) => {
        return {
          ...prev,
          [name]: e.target.value
        };
      });
      setEmailError((prev) => {
        return {
          ...prev,
          [name]: ''
        };
      });
      setEditedData((prev) => {
        return { ...prev, [name]: e.target.value };
      });
    } else {
      setEmailError((prev) => {
        return {
          ...prev,
          [name]: ''
        };
      });
      setSensitveData((prev) => {
        return { ...prev, [name]: e.target.value };
      });

      setEditedData((prev) => {
        return { ...prev, [name]: e.target.value };
      });
    }
  };

  const onSaveInput = (name) => {
    setEmail({ ...email, [name]: sensitiveData[name] });
    setEditedData((prev) => {
      return { ...prev, [name]: sensitiveData[name] };
    });
    setEnabled({ ...enabled, [name]: true });
  };

  const onCancelInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
    setSensitveData({ ...sensitiveData, [name]: '' });
    setEditedData((prev) => {
      return { ...prev };
    });
  };

  const dispatchGetAllAlertEmail = (data) => {
    dispatch(getAllAlertEmail(data));
  };

  const editableStatus = (type) => {
    var status = '';
    emailMetaInfoData &&
      emailMetaInfoData.length !== 0 &&
      emailMetaInfoData.fields.find((field) => {
        if (field.name === type) {
          status =
            field.is_editable && field.is_sensitive
              ? 'sensitive'
              : field.is_editable
              ? 'editable'
              : '';
        }
        return '';
      });
    return status;
  };

  const editAndSaveButton = (name) => {
    return (
      <>
        {enabled[name] ? (
          <button
            className="btn black-button"
            onClick={() => setEnabled({ ...enabled, [name]: false })}>
            <img src={Edit} alt="Edit" />
            <span>Edit</span>
          </button>
        ) : (
          <>
            <button
              className="btn black-button"
              onClick={() => onSaveInput(name)}>
              <span>Save</span>
            </button>
            <button
              className="btn black-secondary-button"
              onClick={() => onCancelInput(name)}>
              <span>Cancel</span>
            </button>
          </>
        )}
      </>
    );
  };

  const slackEditableStatus = (type) => {
    var status = '';
    slackMetaInfoData &&
      slackMetaInfoData.length !== 0 &&
      slackMetaInfoData.fields.find((field) => {
        if (field.name === type) {
          status =
            field.is_editable && field.is_sensitive
              ? 'sensitive'
              : field.is_editable
              ? 'editable'
              : '';
        }
        return '';
      });
    return status;
  };

  if (editLoading || emailMetaInfoLoading || slackMetaInfoLoading) {
    return (
      <div className="load">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        {data[3] === 'slack' ? (
          <>
            <div className="form-group form-title-image">
              <img src={Slack} alt="Slack" />
            </div>
            <div className="form-group">
              <label>Webhook URL *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    placeholderSlack.webhook_url || 'Enter Webhook URL'
                  }
                  value={
                    slackEdit.webhook_url
                      ? slackData.webhook_url
                      : sensitveSlack.webhook_url
                  }
                  disabled={
                    data[4] === 'edit'
                      ? slackEditableStatus('webhook_url') === 'editable'
                        ? false
                        : slackEditableStatus('webhook_url') === 'sensitive'
                        ? slackEdit.webhook_url
                        : true
                      : false
                  }
                  onChange={(e) => {
                    if (slackEdit.webhook_url) {
                      // setWebhookUrl(e.target.value);
                      setWebhookUrlError(false);
                      setSlackData({
                        ...slackData,
                        webhook_url: e.target.value
                      });
                    } else {
                      //setEditedWebhookUrl(e.target.value);
                      setSensitveSlack({
                        ...sensitveSlack,
                        webhook_url: e.target.value
                      });
                    }
                  }}
                />

                {data[4] === 'edit' &&
                  slackEditableStatus('webhook_url') === 'sensitive' &&
                  (slackEdit.webhook_url ? (
                    <button
                      className="btn black-button"
                      onClick={() =>
                        setSlackEdit({ ...slackEdit, webhook_url: false })
                      }>
                      <img src={Edit} alt="Edit" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn black-button"
                        onClick={() => {
                          //setWebhookUrl(editedWebhookUrl);
                          setSlackData({
                            ...slackData,
                            webhook_url: sensitveSlack.webhook_url
                          });
                          setEditedSlack({
                            ...editedSlack,
                            webhook_url: sensitveSlack.webhook_url
                          });
                          setSlackEdit({ ...slackEdit, webhook_url: true });
                        }}>
                        <span>Save</span>
                      </button>
                      <button
                        className="btn black-secondary-button"
                        onClick={() => {
                          setSlackEdit({ ...slackEdit, webhook_url: true });
                          setSensitveSlack({
                            ...sensitveSlack,
                            webhook_url: ''
                          });
                          setEditedSlack({
                            ...editedSlack
                          });
                        }}>
                        <span>Cancel</span>
                      </button>
                    </>
                  ))}
              </div>
              {webhookUrlError && (
                <div className="connection__fail">
                  <p>Enter Webhook URL</p>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Channel name</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderSlack.channel_name || 'Channel Name'}
                  disabled={
                    data[4] === 'edit'
                      ? slackEditableStatus('channel_name') === 'editable'
                        ? false
                        : slackEditableStatus('channel_name') === 'sensitive'
                        ? slackEdit.channel_name
                        : true
                      : false
                  }
                  value={
                    slackEdit.channel_name
                      ? slackData.channel_name
                      : sensitveSlack.channel_name
                  }
                  onChange={(e) => {
                    if (slackEdit.channel_name) {
                      setChannelNameError(false);
                      setSlackData({
                        ...slackData,
                        channel_name: e.target.value
                      });
                    } else {
                      setSensitveSlack({
                        ...sensitveSlack,
                        channel_name: e.target.value
                      });
                    }
                  }}
                />
                {data[4] === 'edit' &&
                  slackEditableStatus('channel_name') === 'sensitive' &&
                  (slackEdit.channel_name ? (
                    <button
                      className="btn black-button"
                      onClick={() =>
                        setSlackEdit({ ...slackEdit, channel_name: false })
                      }>
                      <img src={Edit} alt="Edit" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn black-button"
                        onClick={() => {
                          setSlackEdit({ ...slackEdit, channel_name: true });
                          setEditedSlack({
                            ...editedSlack,
                            channel_name: sensitveSlack.channel_name
                          });
                        }}>
                        <span>Save</span>
                      </button>
                      <button
                        className="btn black-secondary-button"
                        onClick={() => {
                          setSlackEdit({ ...slackEdit, channel_name: true });
                          setSensitveSlack({
                            ...sensitveSlack,
                            channel_name: ''
                          });
                          setEditedSlack({
                            ...editedSlack
                          });
                        }}>
                        <span>Cancel</span>
                      </button>
                    </>
                  ))}
              </div>
              {channelNameError && (
                <div className="connection__fail">
                  <p>Enter Channel Name</p>
                </div>
              )}
            </div>
          </>
        ) : data[3] === 'email' ? (
          <>
            <div className="form-group form-title-image">
              <img src={Email} alt="Email" />
            </div>
            <div className="form-group">
              <label>SMTP server *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter SMTP server"
                  name="server"
                  value={enabled.server ? email.server : sensitiveData.server}
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('server') === 'editable'
                        ? false
                        : editableStatus('server') === 'sensitive'
                        ? enabled.server
                        : true
                      : false
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('server') === 'sensitive' &&
                  editAndSaveButton('server')}
              </div>
              {emailError.server !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.server}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Port *</label>
              <div className="editable-field">
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Enter Port"
                  name="port"
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('port') === 'editable'
                        ? false
                        : editableStatus('port') === 'sensitive'
                        ? enabled.port
                        : true
                      : false
                  }
                  value={enabled.port ? email.port : sensitiveData.port}
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('port') === 'sensitive' &&
                  editAndSaveButton('port')}
              </div>
              {emailError.port !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.port}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Username *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeHolderEmail.username || 'Enter Username'}
                  name="username"
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('username') === 'editable'
                        ? false
                        : editableStatus('username') === 'sensitive'
                        ? enabled.username
                        : true
                      : false
                  }
                  value={
                    enabled.username ? email.username : sensitiveData.username
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('username') === 'sensitive' &&
                  editAndSaveButton('username')}
              </div>
              {emailError.username !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.username}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Password *</label>
              <div className="editable-field">
                <input
                  type="password"
                  className="form-control"
                  placeholder={placeHolderEmail.password || 'Enter Password'}
                  name="password"
                  value={
                    enabled.password ? email.password : sensitiveData.password
                  }
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('password') === 'editable'
                        ? false
                        : editableStatus('password') === 'sensitive'
                        ? enabled.password
                        : true
                      : false
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('password') === 'sensitive' &&
                  editAndSaveButton('password')}
              </div>
              {emailError.password !== '' ? (
                <div className="connection__fail">
                  <p>Enter password</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Email Sender *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Email"
                  name="sender_email"
                  value={
                    enabled.sender_email
                      ? email.sender_email
                      : sensitiveData.sender_email
                  }
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('sender_email') === 'editable'
                        ? false
                        : editableStatus('sender_email') === 'sensitive'
                        ? enabled.sender_email
                        : true
                      : false
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('sender_email') === 'sensitive' &&
                  editAndSaveButton('sender_email')}
              </div>
              {emailError.sender_email !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.sender_email}</p>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="form-action">
          <button
            className={
              emailLoading ? 'btn black-button btn-loading' : 'btn black-button'
            }
            onClick={() => alertHandler()}>
            <div className="btn-spinner">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>Loading...</span>
            </div>
            <div className="btn-content">
              <span>Save</span>
            </div>
          </button>
        </div>
      </>
    );
  }
};
export default AlertsForm;
