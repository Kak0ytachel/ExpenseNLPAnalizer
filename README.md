# Expense NLP Analizer

> This project was made as an assignment at a short (month-long) course of Natural Language Processing (NLP)

A simple frontend application made with React, Vite and Transformers.js that downloads a custom pre-trained model from HuggingFace and uses it to determine expence's category based on its bank message.

The model was trained based on `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` (multilingual zero-shot classification) and pre-trained on about 300 bank transaction records in polish using a 5-fold cross-validation method. 
The resulting model was transformed to an ONNX one and quantified (1 gb shrunk to 300 mb) using `optimum-cli`. It is available at [HuggingFace](https://huggingface.co/chel0d/xlm-roberta-expences-categories-pl). 

**Warning**: the custom pre-trained model was made for polish language and generally ~sucks~ _works poorly_. It could not be a production solution, only a tech demo. 

The app is currenly available at https://kak0ytachel.github.io/ExpenseNLPAnalizer/ . Note that it downloads a 300 mb model package at the first input, so it may take some time to process.

<img width="1878" height="1218" alt="Image" src="https://github.com/user-attachments/assets/9dcd5c6b-db32-41d1-93b2-5da158febf33" />

