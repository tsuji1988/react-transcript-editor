import React from 'react';
import PropTypes from 'prop-types';
import TimedTextEditor from '../timed-text-editor';
import MediaPlayer from '../media-player';
import VideoPlayer from '../video-player';
import Settings from '../settings';
import Shortcuts from '../keyboard-shortcuts';
import { secondsToTimecode } from '../../util/timecode-converter';
import Header from './src/Header.js';

import style from './index.module.css';

// TODO: move to another file with tooltip - rename HowDoesThisWork or HelpMessage
import HowDoesThisWork from './src/HowDoesThisWork.js';

class TranscriptEditor extends React.Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();

    this.state = {
      currentTime: 0,
      transcriptData: null,
      isScrollIntoViewOn: false,
      showSettings: false,
      showShortcuts: false,
      isPauseWhileTypingOn: true,
      rollBackValueInSeconds: 15,
      timecodeOffset: 0,
      showTimecodes: true,
      showSpeakers: true,
      previewIsDisplayed: true,
      mediaDuration: '00:00:00:00'
      // previewViewWidth: '25'
    };
    this.timedTextEditorRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.transcriptData !== null) {
      return {
        transcriptData: nextProps.transcriptData
      };
    }

    return null;
  }

  // performance optimization
  shouldComponentUpdate = (nextProps, nextState) => {

    if (nextState.transcriptData !== this.state.transcriptData) {
      return true;
    }

    if (nextProps.mediaUrl !== this.props.mediaUrl) {
      return true;
    }

    if (nextState.currentTime !== this.state.currentTime) {
      return true;
    }

    if (nextState.isScrollIntoViewOn !== this.state.isScrollIntoViewOn) {
      return true;
    }

    if (nextState.showSettings !== this.state.showSettings) {
      return true;
    }

    if (nextState.showShortcuts !== this.state.showShortcuts) {
      return true;
    }

    if (nextState.isPauseWhileTypingOn !== this.state.isPauseWhileTypingOn) {
      return true;
    }

    if (nextState.rollBackValueInSeconds !== this.state.rollBackValueInSeconds) {
      return true;
    }

    if (nextState.timecodeOffset !== this.state.timecodeOffset) {
      return true;
    }

    if (nextState.showTimecodes !== this.state.showTimecodes) {
      return true;
    }

    if (nextState.showSpeakers !== this.state.showSpeakers) {
      return true;
    }

    if (nextState.previewIsDisplayed !== this.state.previewIsDisplayed) {
      return true;
    }

    if (nextState.mediaDuration !== this.state.mediaDuration) {
      return true;
    }

    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    // Transcript and media passed to component at same time
    if (
      prevState.transcriptData !== this.state.transcriptData &&
      prevProps.mediaUrl !== this.props.mediaUrl
    ) {
      console.info('Transcript and media');
      this.ifPresentRetrieveTranscriptFromLocalStorage();
    }
    // Transcript first and then media passed to component
    else if (
      prevState.transcriptData === this.state.transcriptData &&
      prevProps.mediaUrl !== this.props.mediaUrl
    ) {
      console.info('Transcript first and then media');
      this.ifPresentRetrieveTranscriptFromLocalStorage();
    }
    // Media first and then transcript passed to component
    else if (
      prevState.transcriptData !== this.state.transcriptData &&
      prevProps.mediaUrl === this.props.mediaUrl
    ) {
      console.info('Media first and then transcript');
      this.ifPresentRetrieveTranscriptFromLocalStorage();
    }
  }

  ifPresentRetrieveTranscriptFromLocalStorage = () => {
    const timedTextEditor = this.timedTextEditorRef;
    if (timedTextEditor && timedTextEditor.current) {
      if (
        timedTextEditor.current.isPresentInLocalStorage(this.props.mediaUrl)
      ) {
        console.info('Already present in local storage.');
        timedTextEditor.current.loadLocalSavedData(this.props.mediaUrl);
      } else {
        console.info('Not present in local storage.');
      }
    }
  };

  // eslint-disable-next-line class-methods-use-this
  handleWordClick = startTime => {
    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'doubleClickOnWord',
        name: 'startTime',
        value: secondsToTimecode(startTime)
      });
    }

    this.setCurrentTime(startTime);
  };

  // eslint-disable-next-line class-methods-use-this
  handleTimeUpdate = e => {
    const currentTime = e.target.currentTime;
    this.setState({
      currentTime
    });
  };

  handlePlayMedia = isPlaying => {
    this.playMedia(isPlaying);
  };

  handleIsPlaying = () => {
    return this.isPlaying();
  };

  handleIsScrollIntoViewChange = e => {
    const isChecked = e.target.checked;
    this.setState({ isScrollIntoViewOn: isChecked });

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'handleIsScrollIntoViewChange',
        name: 'isScrollIntoViewOn',
        value: isChecked
      });
    }
  };
  handlePauseWhileTyping = e => {
    const isChecked = e.target.checked;
    this.setState({ isPauseWhileTypingOn: isChecked });

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'handlePauseWhileTyping',
        name: 'isPauseWhileTypingOn',
        value: isChecked
      });
    }
  };

  handleRollBackValueInSeconds = e => {
    const rollBackValue = e.target.value;
    this.setState({ rollBackValueInSeconds: rollBackValue });

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'handleRollBackValueInSeconds',
        name: 'rollBackValueInSeconds',
        value: rollBackValue
      });
    }
  };

  handleSetTimecodeOffset = timecodeOffset => {
    this.setState({ timecodeOffset: timecodeOffset }, () => {
      this.timedTextEditorRef.current.forceUpdate();
    });
  };

  handleShowTimecodes = e => {
    const isChecked = e.target.checked;
    this.setState({ showTimecodes: isChecked });

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'handleShowTimecodes',
        name: 'showTimecodes',
        value: isChecked
      });
    }
  };

  handleShowSpeakers = e => {
    const isChecked = e.target.checked;
    this.setState({ showSpeakers: isChecked });

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'handleShowSpeakers',
        name: 'showSpeakers',
        value: isChecked
      });
    }
  };

  handleSettingsToggle = () => {
    this.setState(prevState => ({
      showSettings: !prevState.showSettings
    }));

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'handleSettingsToggle',
        name: 'showSettings',
        value: !this.state.showSettings
      });
    }
  };

  handleShortcutsToggle = () => {
    this.setState(prevState => ({
      showShortcuts: !prevState.showShortcuts
    }));

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'handleShortcutsToggle',
        name: 'showShortcuts',
        value: !this.state.showShortcuts
      });
    }
  };

  getEditorContent = exportFormat => {
    return this.timedTextEditorRef.current.getEditorContent(exportFormat);
  };

  handlePreviewIsDisplayed = () => {
    this.setState({
      previewIsDisplayed: !this.state.previewIsDisplayed
    });
  };

  onLoadedDataGetDuration = e => {
    const currentDuration = e.target.duration;
    const currentDurationWithOffset = currentDuration + this.state.timecodeOffset;
    const durationInSeconds = secondsToTimecode(currentDurationWithOffset);

    this.setState({
      mediaDuration: durationInSeconds
    });

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'TranscriptEditor',
        action: 'onLoadedDataGetDuration',
        name: 'durationInSeconds-WithoutOffset',
        value: secondsToTimecode(currentDuration)
      });
    }
  };

  handleChangePreviewViewWidth = e => {
    const newPreviewViewWidth = e.target.value;
    this.setState({
      previewViewWidth: newPreviewViewWidth
    });
  };

  handleSaveTranscript = () => {
    alert('The changes to this transcript have been saved in your browser');
    
    this.timedTextEditorRef.current.updateTimestampsForEditorState();

    return this.timedTextEditorRef.current.localSave(this.props.mediaUrl);
  };

  render() {
    const videoPlayer = (
      <VideoPlayer
        mediaUrl={ this.props.mediaUrl }
        onTimeUpdate={ this.handleTimeUpdate }
        // onClick={ this.props.onClick }
        videoRef={ this.videoRef }
        previewIsDisplayed={ this.state.previewIsDisplayed }
        onLoadedDataGetDuration={ this.onLoadedDataGetDuration }
        // viewWith={ this.state.previewViewWidth }
      />
    );

    const mediaControls = (
      <MediaPlayer
        title={ this.props.title ? this.props.title : '' }
        mediaDuration={ this.state.mediaDuration }
        currentTime={ this.state.currentTime }
        hookSeek={ foo => (this.setCurrentTime = foo) }
        hookPlayMedia={ foo => (this.playMedia = foo) }
        hookIsPlaying={ foo => (this.isPlaying = foo) }
        rollBackValueInSeconds={ this.state.rollBackValueInSeconds }
        timecodeOffset={ this.state.timecodeOffset }
        // hookOnTimeUpdate={ this.handleTimeUpdate }
        mediaUrl={ this.props.mediaUrl }
        // ref={ 'MediaPlayer' }
        handleAnalyticsEvents={ this.props.handleAnalyticsEvents }
        videoRef={ this.videoRef }
        handleSaveTranscript={ this.handleSaveTranscript }
      />
    );

    const settings = (
      <Settings
        handleSettingsToggle={ this.handleSettingsToggle }
        defaultValuePauseWhileTyping={ this.state.isPauseWhileTypingOn }
        defaultValueScrollSync={ this.state.isScrollIntoViewOn }
        defaultRollBackValueInSeconds={ this.state.rollBackValueInSeconds }
        timecodeOffset={ this.state.timecodeOffset }
        showTimecodes={ this.state.showTimecodes }
        showSpeakers={ this.state.showSpeakers }
        handlePauseWhileTyping={ this.handlePauseWhileTyping }
        handleIsScrollIntoViewChange={ this.handleIsScrollIntoViewChange }
        handleRollBackValueInSeconds={ this.handleRollBackValueInSeconds }
        handleSetTimecodeOffset={ this.handleSetTimecodeOffset }
        handleShowTimecodes={ this.handleShowTimecodes }
        handleShowSpeakers={ this.handleShowSpeakers }
        handleAnalyticsEvents={ this.props.handleAnalyticsEvents }
        previewIsDisplayed={ this.state.previewIsDisplayed }
        handlePreviewIsDisplayed={ this.handlePreviewIsDisplayed }
        // previewViewWidth={ this.state.previewViewWidth }
        handleChangePreviewViewWidth={ this.handleChangePreviewViewWidth }
      />
    );

    const shortcuts = (
      <Shortcuts handleShortcutsToggle={ this.handleShortcutsToggle } />
    );

    const timedTextEditor = (
      <TimedTextEditor
        fileName={ this.props.fileName }
        transcriptData={ this.state.transcriptData }
        timecodeOffset={ this.state.timecodeOffset }
        onWordClick={ this.handleWordClick }
        playMedia={ this.handlePlayMedia }
        isPlaying={ this.handleIsPlaying }
        currentTime={ this.state.currentTime }
        isEditable={ this.props.isEditable }
        spellCheck={ this.props.spellCheck }
        sttJsonType={ this.props.sttJsonType }
        mediaUrl={ this.props.mediaUrl }
        isScrollIntoViewOn={ this.state.isScrollIntoViewOn }
        isPauseWhileTypingOn={ this.state.isPauseWhileTypingOn }
        showTimecodes={ this.state.showTimecodes }
        showSpeakers={ this.state.showSpeakers }
        ref={ this.timedTextEditorRef }
        handleAnalyticsEvents={ this.props.handleAnalyticsEvents }
      />
    );

    return (
      <div className={ style.container }>
        {this.props.mediaUrl === null ? null : <Header
          showSettings={ this.state.showSettings }
          showShortcuts={ this.state.showShortcuts }
          settings={ settings }
          shortcuts={ shortcuts }
          tooltip={ HowDoesThisWork }
          mediaUrl={ this.props.mediaUrl }
          mediaControls={ mediaControls }
          handleSettingsToggle={ this.handleSettingsToggle }
          handleShortcutsToggle={ this.handleShortcutsToggle }
        />}

        <div className={ style.grid }>
          <section className={ style.row }>
            <aside className={ style.aside }>
              {this.props.mediaUrl === null ? null : videoPlayer}
            </aside>
            <main className={ style.main }>
              {this.props.mediaUrl !== null &&
              this.props.transcriptData !== null
                ? timedTextEditor
                : null}
            </main>
          </section>
        </div>
      </div>
    );
  }
}

TranscriptEditor.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string,
  mediaUrl: PropTypes.string,
  isEditable: PropTypes.bool,
  spellCheck: PropTypes.bool,
  sttJsonType: PropTypes.string,
  handleAnalyticsEvents: PropTypes.func,
  fileName: PropTypes.string,
  transcriptData: PropTypes.object
};

export default TranscriptEditor;
