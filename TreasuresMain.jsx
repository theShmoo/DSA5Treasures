import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';

import DSAMediaCard from '../controls/DSAMediaCard';
import DSAButton from '../controls/DSAButton';
import DSADialog from '../controls/DSADialog';
import DSAItemList from '../controls/DSAItemList';
import DSAInfoBox from '../controls/DSAInfoBox';
import { DSAGrid, DSAGridItem, DSAGridRow} from '../controls/DSAGrid';

import {pickRandom, createSeed} from '../utils/RandomUtils';

import {TreasureProbabilities,
  TreasureTypes,
  TreasureMisc,
  JewelleryMaterial,
  GemKarat} from '../data/DSATreasures';

const styles = {
  root: {
    flexGrow: 1,
  }
};

class TreasuresMain extends React.Component {

  state = {
    open: false,
    current : {
      title: "",
      description: []
    },
    history: []
  };

  handleClickOpen(action) {
    const c = action();
    this.setState(state => {
      const history = [...state.history, c];
      return {
        open: true,
        current: c,
        history: history
      }
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  karatDescription(seed) {
    return " mit " + pickRandom(GemKarat, seed).amount + " Karat";
  }

  getRandomGem(seed) {
    return pickRandom(TreasureTypes.gems, seed).description + this.karatDescription(seed);
  }

  replaceGem(description, seed) {
    const numGems = Math.floor((seed() * 6) + 1);
    let gems = numGems + " " + this.getRandomGem(seed);

    description = description.replace(/1W6 Juwelen/g, gems);
    return description.replace(/Juwel/g, this.getRandomGem(seed));
  }

  getRandomTreasure = () => {
    let seed = createSeed();
    const picked = pickRandom(TreasureProbabilities, seed);
    const types = picked.types.map((t) => pickRandom(TreasureTypes[t], seed));
    const additions = picked.types.map((t) => {
      if(t === "jewellery")
        return " aus " + pickRandom(JewelleryMaterial, seed).description;
      else if(t === "gems")
        return this.karatDescription(seed);
      else
        return ""
    });

    const typeDescriptions = types.map((t, i) => ({
        "value": this.replaceGem(t.description, seed) + additions[i]
    }));

    return {
      title: picked.description,
      description: typeDescriptions
    };
  }

  getRandomObject = () => {
    let seed = createSeed();
    let all_picked = [];
    const p = Math.floor((Math.random() * 6) + 1);
    for(let i = 0; i < p; ++i) {
      all_picked.push(pickRandom(TreasureMisc, seed));
    }

    const typeDescriptions = all_picked.map((t) => ({
        "value": this.replaceGem(t.description, seed) + " aus " + pickRandom(JewelleryMaterial, seed).description,
    }));

    return {
      title: "Gefundene Objekte",
      description: typeDescriptions
    };
  }

  getAction(action) {
    return <DSAButton size="small" onClick={() => this.handleClickOpen(action)}>Suche</DSAButton>
  }

  getDialogActions() {
    return <DSAButton onClick={this.handleClose}>Schließen</DSAButton>
  }

  getHistory() {
    if(this.state.history.length > 0) {
      const history = this.state.history.map((h) => {
          return {
                title: h.title,
                items: h.description
              }});
      return <DSAGridRow>
          <DSAInfoBox title="Gefundene Schätze"><DSAItemList items={history}/></DSAInfoBox>
        </DSAGridRow>;
    }
    else {
      return "";
    }
  }

  render() {
    const { classes } = this.props;
    return <main className={classes.root}>
        <DSAGrid>
          <DSAGridRow>
            <DSAInfoBox title="Schätze und Kostbarkeiten" />
          </DSAGridRow>
          <DSAGrid>
            <DSAGridItem xs={12} md={6} lg={3} key={0}>
              <DSAMediaCard
                imagesrc="img/mondamulet.jpg"
                imagetitle="Generiere einen zufälligen Schatz"
                title="Zufallsschatz"
                content="Finde einen zufälligen Schatz. Dieser kann aus Münzen, Edelsteinen oder Schmuck bestehen."
                actions={this.getAction(this.getRandomTreasure)} />
              </DSAGridItem>
            <DSAGridItem xs={12} md={6} lg={3} key={1}>
              <DSAMediaCard
                imagesrc="img/brotbeutel.jpg"
                imagetitle="Generiere einen zufälligen Gegenstand"
                title="Zufallsgegenstand"
                content="Finde einen zufälligen Gegenstand. Es werden Alltagsgegenstände wie Besteck gefunden."
                actions={this.getAction(this.getRandomObject)} />
            </DSAGridItem>
          </DSAGrid>
          {this.getHistory()}
        </DSAGrid>
        <DSADialog
          handleClose={this.handleClose}
          open={this.state.open}
          actions={this.getDialogActions()}
          title={this.state.current.title}>
            <DSAItemList items={this.state.current.description} />
        </DSADialog>
      </main>;
  }
};

TreasuresMain.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withWidth()(withStyles(styles)(TreasuresMain));
