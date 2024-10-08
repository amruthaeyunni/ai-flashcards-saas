'use client'
import { db } from "@/firebase"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDoc, writeBatch, doc, setDoc} from "firebase/firestore"
import {Container, Box, Typography, Paper, TextField, Card, Grid, CardActionArea, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button} from "@mui/material"

export default function Generate() {
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async => {
        fetch('api/generate', {
            method: 'POST',
            body: text,
        }).then((res) => res.json()).then(data => setFlashcards(data))
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashcards = async () => {
      if (!name) {
          alert('Please enter a name');
          return;
      }
  
      // Use a general or public collection
      const batch = writeBatch(db);
      const colRef = collection(db, 'flashcards'); 
  
      // Add the flashcards collection name to a top-level document if needed
      const collectionDocRef = doc(colRef, name);
      await setDoc(collectionDocRef, { name });
  
      flashcards.forEach((flashcard) => {
          const cardDocRef = doc(collection(collectionDocRef, 'cards'));
          batch.set(cardDocRef, flashcard);
      });
  
      try {
          await batch.commit();
          handleClose();
          router.push('/flashcards');
      } catch (error) {
          console.error('Error saving flashcards:', error);
          alert('Failed to save flashcards.');
      }
  };

    return(
      <Container maxWidth="md">
        <Box 
          sx={{
            mt: 4, 
            mb: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
          }}
        >
          <Box sx={{textAlign: 'center'}}>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{mb: 2, p: 2, mr: 7}} 
              onClick={() => (router.push('/flashcards'))}
            >
              Collections
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{mb: 2, p: 2}} 
              onClick={() => (router.push('/'))}
            >
              Home
            </Button>
          </Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Generate Flashcards</Typography>
          <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>Enter a theme or detailed description to create 10 custom flashcards. 
            They do take around 10 seconds to generate so don't worry if you cannot see anything 
            on the page immediately!</Typography>
          <Paper sx={{ p: 4, width: "100%"}}>
            <TextField 
              value={text}
              onChange={(e) => setText(e.target.value)}
              label="Enter text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{
                mb: 2,
              }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit} 
                fullWidth
              >
                Submit
              </Button>
          </Paper>
        </Box>

        {flashcards.length > 0 && (
            <Box sx={{mt: 4,}}>
              <Typography variant="h5" gutterBottom textAlign="center" sx={{ mb: 4 }}>Flashcards Preview</Typography>
              <Grid container columnSpacing={30} rowSpacing={4} sx={{ transform: 'translateX(-60px)' }}>
                {flashcards.map((flashcard, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{width: 340}}>
                          <CardActionArea onClick={() => {
                            handleCardClick(index)
                          }}>
                            <CardContent>
                              <Box sx={{
                                perspective: '1000px',
                                '& > div': {
                                  transition: 'transform 0.6s',
                                  transformStyle: 'preserve-3d',
                                  position: 'relative',
                                  width: '100%',
                                  height: '300px',
                                  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                                  transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                },
                                '& > div > div': {
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  backfaceVisibility: 'hidden',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: 2,
                                  boxSizing: 'border-box',
                                },
                                '& > div > div:nth-of-type(2)': {
                                  transform: 'rotateY(180deg)',
                                  //backgroundColor: '#F0FFFF',
                                },
                                '& > div > div:first-of-type': {
                                  backgroundColor: '#87CEEB', // Front card color
                                },
                              }}>
                              <div>
                                <div>
                                  <Typography variant="h5" component="div">
                                    {flashcard.front}
                                  </Typography>
                                </div>
                                <div>
                                  <Typography variant="h5" component="div">
                                    {flashcard.back}
                                  </Typography>
                                </div>
                              </div>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                    </Grid>
                ))}
              </Grid>
              <Box sx={{mt: 4, display: 'flex', justifyContent: 'center'}}>
                <Button variant="contained" color='primary' onClick={handleOpen}>
                    Save
                </Button>
              </Box>
            </Box>
        )}

        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Save Flashcards</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a name for your flashcards collection 
                </DialogContentText>
                <TextField 
                  autoFocus 
                  margin='dense' 
                  label='Collection Name'
                  type="text" 
                  fullWidth 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={saveFlashcards}>Save</Button>
            </DialogActions>
        </Dialog>
      </Container>
    )
}