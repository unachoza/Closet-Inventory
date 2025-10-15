import { useState, FormEvent, ChangeEvent } from "react";
import { useLocalStorage } from "./useLocal";
import type { ItemFormData } from "../utils/types";

export const useForm = (initialValues: Record<string, any>) => {
      //values of the object in the form, update the form with new values
      const [values, setValues] = useState(initialValues);

      //handle submit

      const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            //form validate 
            
      };

      // post to local storage

      return [values, (e: ChangeEvent<HTMLInputElement>) => setValues({ ...values, [e.target.name]: e.target.value })];
};
